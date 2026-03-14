import React, { useState, useRef } from 'react';
import {
View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import Popup from '@/components/Popup';
import { Camera, FileText, Tag, DollarSign, X, Check, MapPin, Navigation } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';
import { useLocation } from '@/contexts/LocationContext';
import { getCurrentLocation, getCityFromCoordinates } from '@/services/locationService';
import CityPickerModal from '@/components/CityPickerModal';
import NotificationBell from '@/components/NotificationBell';
import { useGuidance } from '@/contexts/GuidanceContext';
import { Tooltip, PostingGuidance } from '@/components/guidance';
import { useTranslation } from 'react-i18next';

type PickedImageMeta = {
  fileName?: string | null;
  mimeType?: string | null;
};

export default function PostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isFrench = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().startsWith('fr');
  const txt = (fr: string, en: string) => (isFrench ? fr : en);
  const { userLocation, currentCity } = useLocation();
  const { shouldShowTooltip, markTooltipDismissed, markActionCompleted, incrementScreenView, getTooltipContent } = useGuidance();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageMetaMap, setImageMetaMap] = useState<Record<string, PickedImageMeta>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showNoCreditsPopup, setShowNoCreditsPopup] = useState(false);
  const [newListingId, setNewListingId] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  
  // Guidance state
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const guidanceRef = useRef<any>(null);
  
  // Refs for tooltip positioning
  const titleInputRef = useRef<any>(null);
  const descriptionInputRef = useRef<any>(null);
  const priceInputRef = useRef<any>(null);
  const categoryButtonRef = useRef<any>(null);
  const locationInputRef = useRef<any>(null);
  const photosRef = useRef<any>(null);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setDescription('');
    setPrice('');
    setImages([]);
    setImageMetaMap({});
    setNewListingId(null);
  };

  const categories = [
    { label: txt('Téléphones', 'Phones'), value: 'telephones' },
    { label: txt('Véhicules', 'Vehicles'), value: 'vehicules' },
    { label: txt('Électronique', 'Electronics'), value: 'electronique' },
    { label: txt('Maison & Jardin', 'Home & Garden'), value: 'maison-jardin' },
    { label: txt('Mode & Beauté', 'Fashion & Beauty'), value: 'mode-beaute' },
    { label: txt('Emplois', 'Jobs'), value: 'emplois' },
    { label: txt('Services', 'Services'), value: 'services' },
    { label: txt('Immobilier', 'Real estate'), value: 'immobilier' },
    { label: txt('Autre', 'Other'), value: 'autre' },
  ];

  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert(txt('Maximum 5 images', 'Maximum 5 images'), txt('Vous ne pouvez pas ajouter plus de 5 images.', 'You cannot add more than 5 images.'));
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(txt('Permission refusée', 'Permission denied'), txt('Accès à la bibliothèque de photos requis.', 'Photo library access is required.'));
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
      base64: false,
      exif: false,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const picked = result.assets[0];
      setImages(prev => [...prev, picked.uri]);
      setImageMetaMap(prev => ({
        ...prev,
        [picked.uri]: {
          fileName: picked.fileName,
          mimeType: picked.mimeType,
        },
      }));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const imageToRemove = prev[index];
      if (imageToRemove) {
        setImageMetaMap(current => {
          const next = { ...current };
          delete next[imageToRemove];
          return next;
        });
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCategorySelect = (value: string) => {
    setCategory(value);
    setShowCategoryModal(false);
  };

  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      const coords = await getCurrentLocation();
      if (coords) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        const cityName = await getCityFromCoordinates(coords.latitude, coords.longitude);
        if (cityName) {
          setCity(cityName);
        }
      }
    } catch (error) {
      console.error('[Location] Detection failed:', error);
      console.log('[Location] Continuing with manual city selection');
    } finally {
      setDetectingLocation(false);
    }
  };

  // Auto-detect location on mount and track screen view
  React.useEffect(() => {
    incrementScreenView('post');
    
    if (userLocation && currentCity) {
      setLatitude(userLocation.latitude);
      setLongitude(userLocation.longitude);
      setCity(currentCity);
    } else {
      detectLocation();
    }
  }, []);

  const handleSubmit = async () => {
    console.log('[POST] Starting submission process...');
    console.log('[POST] Platform:', Platform.OS);
    console.log('[POST] User ID:', user?.id);
    
    // Validation
    if (!user?.phone || !user?.location) {
      console.log('[POST] Validation failed: Incomplete profile');
      Alert.alert(
        txt('Profil incomplet', 'Incomplete profile'),
        txt('Complétez votre numéro WhatsApp et votre ville.', 'Complete your WhatsApp number and city.'),
        [
          { text: txt('Compléter', 'Complete'), onPress: () => router.push('/auth/complete-profile') },
          { text: txt('Annuler', 'Cancel'), style: 'cancel' },
        ]
      );
      return;
    }

    // Basic field validation
    if (!title || !category || !description || !price || images.length === 0) {
      console.log('[POST] Validation failed:', { 
        hasTitle: !!title, 
        hasCategory: !!category, 
        hasDescription: !!description, 
        hasPrice: !!price, 
        imageCount: images.length 
      });
      Alert.alert(txt('Erreur', 'Error'), txt('Tous les champs et au moins une image sont requis.', 'All fields and at least one image are required.'));
      return;
    }

    // Description length validation (backend requires minimum 20 characters)
    const MIN_DESCRIPTION_LENGTH = 20;
    if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      console.log('[POST] Validation failed: Description too short', description.trim().length);
      Alert.alert(
        txt('Description trop courte', 'Description too short'),
        txt(
          `La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères pour aider les acheteurs à comprendre votre article.\n\nActuellement: ${description.trim().length} caractères\nManquant: ${MIN_DESCRIPTION_LENGTH - description.trim().length} caractères`,
          `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters to help buyers understand your item.\n\nCurrent: ${description.trim().length} characters\nNeeded: ${MIN_DESCRIPTION_LENGTH - description.trim().length} more characters`
        )
      );
      return;
    }

    // Title length validation
    const MIN_TITLE_LENGTH = 5;
    if (title.trim().length < MIN_TITLE_LENGTH) {
      console.log('[POST] Validation failed: Title too short', title.length);
      Alert.alert(
        txt('Titre trop court', 'Title too short'),
        txt(
          `Le titre doit contenir au moins ${MIN_TITLE_LENGTH} caractères. Actuellement: ${title.trim().length} caractères.`,
          `Title must be at least ${MIN_TITLE_LENGTH} characters. Currently: ${title.trim().length} characters.`
        )
      );
      return;
    }

    // Price validation
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      console.log('[POST] Validation failed: Invalid price', price);
      Alert.alert(
        txt('Prix invalide', 'Invalid price'),
        txt('Veuillez entrer un prix valide supérieur à 0.', 'Please enter a valid price greater than 0.')
      );
      return;
    }

    console.log('[POST] Validation passed');
    console.log('[POST] Form data:', { 
      title: title.trim(), 
      titleLength: title.trim().length,
      category, 
      descriptionLength: description.trim().length, 
      price: priceValue, 
      imageCount: images.length,
      city,
      hasCoordinates: !!(latitude && longitude)
    });

    setIsSubmitting(true);

    try {
      // Check credits
      console.log('[POST] Checking user credits...');
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
      
      if (userErr) {
        console.error('[POST] Credits check error:', userErr);
        throw new Error(`Credits error: ${userErr.message}`);
      }
      
      console.log('[POST] User credits:', userData?.credits);
      
      if (!userData || userData.credits <= 0) {
        console.log('[POST] Insufficient credits');
        setShowNoCreditsPopup(true);
        return;
      }

      // Get category
      console.log('[POST] Fetching category ID for:', category);
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      
      if (catErr) {
        console.error('[POST] Category fetch error:', catErr);
        throw new Error(`Category error: ${catErr.message}`);
      }
      
      if (!catData) {
        console.error('[POST] Category not found:', category);
        throw new Error('Category not found');
      }
      
      console.log('[POST] Category ID:', catData.id);

      const extensionFromFileName = (fileName?: string | null): string | null => {
        if (!fileName || !fileName.includes('.')) return null;
        return fileName.split('.').pop()?.toLowerCase() || null;
      };

      const extensionFromUri = (uri: string): string | null => {
        try {
          const parsedUrl = new URL(uri);
          const path = parsedUrl.pathname || '';
          if (!path.includes('.')) return null;
          return path.split('.').pop()?.toLowerCase() || null;
        } catch {
          if (!uri.includes('.')) return null;
          const normalized = uri.split('?')[0].split('#')[0];
          return normalized.split('.').pop()?.toLowerCase() || null;
        }
      };

      const extensionFromMimeType = (mimeType?: string | null): string | null => {
        if (!mimeType?.includes('/')) return null;
        const subtype = mimeType.split('/')[1]?.toLowerCase();
        if (!subtype) return null;
        if (subtype === 'jpeg') return 'jpg';
        if (subtype === 'svg+xml') return 'svg';
        return subtype;
      };

      const sanitizeExtension = (extension: string | null): string => {
        if (!extension) return 'jpg';
        const cleaned = extension.replace(/[^a-z0-9]/gi, '').toLowerCase();
        return cleaned || 'jpg';
      };

      const getMimeType = (extension: string, providedMimeType?: string | null): string => {
        if (providedMimeType) return providedMimeType;
        const mimeTypes: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
          heic: 'image/heic',
          heif: 'image/heif',
        };
        return mimeTypes[extension] || 'image/jpeg';
      };

      // Upload images
      console.log('[POST] Starting image upload process...');
      console.log('[POST] Number of images to upload:', images.length);
      const imageUrls: string[] = [];
      
      for (let idx = 0; idx < images.length; idx++) {
        const uri = images[idx];
        console.log(`[POST] Processing image ${idx + 1}/${images.length}`);
        console.log(`[POST] Image URI:`, uri.substring(0, 50) + '...');
        
        const imageMeta = imageMetaMap[uri];
        console.log(`[POST] Image meta:`, imageMeta);
        
        const ext = sanitizeExtension(
          extensionFromFileName(imageMeta?.fileName) ||
          extensionFromMimeType(imageMeta?.mimeType) ||
          extensionFromUri(uri)
        );
        
        console.log(`[POST] Detected extension:`, ext);
        
        const fileName = `${user.id}/${Date.now()}-${idx}.${ext}`;
        let mimeType = getMimeType(ext, imageMeta?.mimeType);
        console.log(`[POST] File name:`, fileName);
        console.log(`[POST] MIME type:`, mimeType);

        let fileData: any;

        if (Platform.OS === 'web') {
          console.log(`[POST] Web platform - fetching blob...`);
          try {
            const response = await fetch(uri);
            if (!response.ok) {
              console.error(`[POST] Fetch failed:`, response.status, response.statusText);
              throw new Error(`Failed to load image ${idx + 1}: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            console.log(`[POST] Blob size:`, blob.size, 'bytes');
            console.log(`[POST] Blob type:`, blob.type);
            
            if (blob.size === 0) {
              console.error(`[POST] Empty blob for image ${idx + 1}`);
              throw new Error(`Image ${idx + 1} is empty`);
            }
            
            fileData = blob;
            if (blob.type) mimeType = blob.type;
          } catch (fetchError: any) {
            console.error(`[POST] Blob fetch error:`, fetchError);
            throw new Error(`Failed to process image ${idx + 1}: ${fetchError.message}`);
          }
        } else {
          console.log(`[POST] Native platform - fetching array buffer...`);
          try {
            const response = await fetch(uri);
            if (!response.ok) {
              console.error(`[POST] Fetch failed:`, response.status, response.statusText);
              throw new Error(`Failed to load image ${idx + 1}: ${response.statusText}`);
            }
            fileData = await response.arrayBuffer();
            console.log(`[POST] ArrayBuffer size:`, fileData.byteLength, 'bytes');
          } catch (fetchError: any) {
            console.error(`[POST] ArrayBuffer fetch error:`, fetchError);
            throw new Error(`Failed to process image ${idx + 1}: ${fetchError.message}`);
          }
        }

        console.log(`[POST] Uploading to Supabase storage...`);
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(fileName, fileData, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error(`[POST] Upload error for image ${idx + 1}:`, uploadError);
          throw new Error(`Upload failed for image ${idx + 1}: ${uploadError.message}`);
        }

        console.log(`[POST] Image ${idx + 1} uploaded successfully`);

        const { data: urlData } = supabase.storage
          .from('listings')
          .getPublicUrl(fileName);

        console.log(`[POST] Public URL:`, urlData.publicUrl);
        imageUrls.push(urlData.publicUrl);
      }
      
      console.log('[POST] All images uploaded successfully');
      console.log('[POST] Image URLs:', imageUrls);

      // Insert listing
      console.log('[POST] Creating listing record...');
      const listingData = {
        seller_id: user.id,
        title: title.trim(),
        category_id: catData.id,
        description: description.trim(),
        price: parseFloat(price),
        images: imageUrls,
        status: 'active',
        location: user.location,
        latitude,
        longitude,
        city: city || currentCity || user.location,
        country: 'Congo (RDC)',
      };
      
      console.log('[POST] Listing data:', {
        ...listingData,
        images: `[${listingData.images.length} URLs]`,
        titleLength: listingData.title.length,
        descriptionLength: listingData.description.length
      });
      
      const { data: listing, error: insErr } = await supabase
        .from('listings')
        .insert(listingData)
        .select()
        .single();
      
      if (insErr) {
        console.error('[POST] Insert error:', insErr);
        throw new Error(`Insert error: ${insErr.message}`);
      }
      
      console.log('[POST] Listing created with ID:', listing.id);

      // Deduct credit
      console.log('[POST] Deducting credit...');
      const { error: credErr } = await supabase
        .from('users')
        .update({ credits: userData.credits - 1 })
        .eq('id', user.id);
      
      if (credErr) {
        console.error('[POST] Credit deduction error:', credErr);
        throw new Error(`Credit deduction error: ${credErr.message}`);
      }
      
      console.log('[POST] Credit deducted successfully');
      console.log('[POST] Remaining credits:', userData.credits - 1);

      setNewListingId(listing.id);
      
      try {
        await markActionCompleted('first_listing_posted');
      } catch {
        // Ignore
      }
      
      try {
        if (guidanceRef.current?.triggerSuccessCelebration) {
          guidanceRef.current.triggerSuccessCelebration();
        }
      } catch {
        // Ignore
      }
      
      console.log('[POST] ✅ Listing creation completed successfully!');
      setShowSuccessPopup(true);
      resetForm();
    } catch (err: any) {
      console.error('[POST] ❌ Error during submission:', err);
      console.error('[POST] Error stack:', err?.stack);
      console.error('[POST] Full error object:', JSON.stringify(err, null, 2));
      
      let errorMsg = err?.message || err?.toString() || 'Failed to create listing';
      
      // Check for specific database validation errors
      if (errorMsg.includes('description') || errorMsg.includes('check constraint')) {
        console.error('[POST] Description validation error detected');
        errorMsg = txt(
          'La description doit contenir au moins 20 caractères pour créer une annonce. Veuillez ajouter plus de détails sur votre article.',
          'Description must be at least 20 characters to create a listing. Please add more details about your item.'
        );
      } else if (errorMsg.includes('violates check constraint') || errorMsg.includes('constraint')) {
        console.error('[POST] Database constraint error detected');
        errorMsg = txt(
          'Erreur de validation: Veuillez vérifier que tous les champs sont correctement remplis. La description doit contenir au moins 20 caractères.',
          'Validation error: Please check that all fields are properly filled. Description must be at least 20 characters.'
        );
      } else if (errorMsg.includes('null value') || errorMsg.includes('NOT NULL')) {
        console.error('[POST] NULL value error detected');
        errorMsg = txt(
          'Tous les champs requis doivent être remplis. Assurez-vous d\'avoir ajouté un titre, une description (min 20 caractères), un prix et au moins une image.',
          'All required fields must be filled. Make sure you have added a title, description (min 20 chars), price and at least one image.'
        );
      }
      
      console.error('[POST] Error message shown to user:', errorMsg);
      Alert.alert(
        txt('Erreur de création', 'Creation Error'),
        errorMsg
      );
    } finally {
      console.log('[POST] Submission process ended');
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // UI (unchanged)
  // -------------------------------------------------------------------------
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
            <View style={styles.headerIcons}>
              <NotificationBell />
            </View>
          </View>
        
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          <View style={styles.messageContainer}>
            <View style={styles.messageCard}>
              <View style={styles.messageIconContainer}>
                <Text style={styles.messageIcon}>🔐</Text>
              </View>
              <Text style={styles.messageTitle}>{txt('Connexion requise', 'Sign in required')}</Text>
              <Text style={styles.messageText}>{txt('Connectez-vous pour publier vos annonces et commencer à vendre.', 'Sign in to post listings and start selling.')}</Text>
              <TouchableOpacity style={styles.modernActionButton} onPress={() => router.push('/auth/login')}>
                <LinearGradient
                  colors={[Colors.primary, '#7da01a']}
                  style={styles.modernActionButtonGradient}
                >
                  <Text style={styles.buttonText}>{txt('Se connecter', 'Sign in')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (!user.phone || !user.location) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
            <View style={styles.headerIcons}>
              <NotificationBell />
            </View>
          </View>
        
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          <View style={styles.messageContainer}>
            <View style={styles.messageCard}>
              <View style={styles.messageIconContainer}>
                <Text style={styles.messageIcon}>👤</Text>
              </View>
              <Text style={styles.messageTitle}>Profil incomplet</Text>
              <Text style={styles.messageText}>Complétez votre profil avec votre numéro WhatsApp et votre ville pour publier des annonces.</Text>
              <TouchableOpacity style={styles.modernActionButton} onPress={() => router.push('/auth/complete-profile')}>
                <LinearGradient
                  colors={[Colors.primary, '#7da01a']}
                  style={styles.modernActionButtonGradient}
                >
                  <Text style={styles.buttonText}>Compléter mon profil</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <View style={styles.headerIcons}>
            <NotificationBell />
          </View>
        </View>
        
        <View style={styles.formCard}>
          <Text style={styles.pageTitle}>Nouvelle annonce</Text>
          <Text style={styles.pageSubtitle}>Publiez votre article en quelques étapes</Text>

          {/* Posting Guidance Component */}
          <PostingGuidance
            ref={guidanceRef}
            title={title}
            description={description}
            price={price}
            images={images}
            category={category}
            city={city}
            onFieldFocus={(field) => {
              // Show tooltip for the focused field
              if (field === 'title' && shouldShowTooltip('post_title')) {
                setActiveTooltip('post_title');
              } else if (field === 'description' && shouldShowTooltip('post_description')) {
                setActiveTooltip('post_description');
              } else if (field === 'price' && shouldShowTooltip('post_price')) {
                setActiveTooltip('post_price');
              } else if (field === 'category' && shouldShowTooltip('post_category')) {
                setActiveTooltip('post_category');
              } else if (field === 'location' && shouldShowTooltip('post_location')) {
                setActiveTooltip('post_location');
              } else if (field === 'photos' && shouldShowTooltip('post_photo_tips')) {
                setActiveTooltip('post_photo_tips');
              }
            }}
            onFirstListingSuccess={() => {
              markActionCompleted('first_listing_posted');
            }}
          />

          {/* Images */}
          <View style={styles.inputGroup} ref={photosRef}>
            <View style={styles.labelRow}>
              <Camera size={18} color={Colors.primary} />
              <Text style={styles.label}>Images (max 5) *</Text>
            </View>
            <Text style={styles.labelHint}>Ajoutez des photos de qualité pour attirer plus d'acheteurs</Text>
            <View style={styles.imageList}>
              {images.map((uri, i) => (
                <View key={i} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(i)}>
                    <LinearGradient
                      colors={['#ef4444', '#dc2626']}
                      style={styles.removeButtonGradient}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                  <LinearGradient
                    colors={['#f8fafc', '#f1f5f9']}
                    style={styles.addImageGradient}
                  >
                    <Text style={styles.addImageIcon}>📷</Text>
                    <Text style={styles.addImageText}>Ajouter</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Title */}
          <View style={styles.inputGroup} ref={titleInputRef}>
            <View style={styles.labelRow}>
              <FileText size={18} color={Colors.primary} />
              <Text style={styles.label}>Titre *</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input} 
                value={title} 
                onChangeText={setTitle}
                onFocus={() => {
                  if (shouldShowTooltip('post_title')) {
                    setActiveTooltip('post_title');
                  }
                }}
                placeholder="ex: iPhone 11 Pro Max 256GB" 
                placeholderTextColor="#94a3b8"
                maxLength={100} 
              />
            </View>
            <View style={styles.characterCountRow}>
              <Text style={[
                styles.characterCount,
                title.trim().length < 5 && title.length > 0 && styles.characterCountWarning
              ]}>
                {title.trim().length < 5 
                  ? `${title.trim().length}/5 minimum` 
                  : `${title.length}/100`}
              </Text>
              {title.trim().length < 5 && title.length > 0 && (
                <Text style={styles.validationHint}>
                  ⚠️ {5 - title.trim().length} caractères restants
                </Text>
              )}
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup} ref={categoryButtonRef}>
            <View style={styles.labelRow}>
              <Tag size={18} color={Colors.primary} />
              <Text style={styles.label}>Catégorie *</Text>
            </View>
            <TouchableOpacity 
              style={styles.selectContainer} 
              onPress={() => {
                if (shouldShowTooltip('post_category')) {
                  setActiveTooltip('post_category');
                }
                setShowCategoryModal(true);
              }}
            >
              <View style={styles.selectContent}>
                <Text style={[styles.selectText, !category && styles.selectPlaceholder]}>
                  {category ? categories.find(c => c.value === category)?.label : 'Sélectionner une catégorie'}
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Custom Category Input */}
          {category === 'autre' && (
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.input} 
                  value={customCategory} 
                  onChangeText={setCustomCategory} 
                  placeholder="Entrez votre catégorie personnalisée" 
                  placeholderTextColor="#94a3b8"
                  maxLength={50} 
                />
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.inputGroup} ref={descriptionInputRef}>
            <View style={styles.labelRow}>
              <FileText size={18} color={Colors.primary} />
              <Text style={styles.label}>Description *</Text>
            </View>
            <Text style={styles.labelHint}>Décrivez l'état, les caractéristiques et les détails importants (minimum 20 caractères)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                onFocus={() => {
                  if (shouldShowTooltip('post_description')) {
                    setActiveTooltip('post_description');
                  }
                }}
                placeholder="Décrivez votre article en détail..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                maxLength={1000}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.characterCountRow}>
              <Text style={[
                styles.characterCount,
                description.trim().length < 20 && description.length > 0 && styles.characterCountWarning
              ]}>
                {description.trim().length < 20 
                  ? `${description.trim().length}/20 minimum requis` 
                  : `${description.length}/1000`}
              </Text>
              {description.trim().length < 20 && description.length > 0 && (
                <Text style={styles.validationHint}>
                  ⚠️ Encore {20 - description.trim().length} caractères
                </Text>
              )}
            </View>
          </View>

          {/* Price */}
          <View style={styles.inputGroup} ref={priceInputRef}>
            <View style={styles.labelRow}>
              <DollarSign size={18} color={Colors.primary} />
              <Text style={styles.label}>Prix (USD) *</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input} 
                value={price} 
                onChangeText={setPrice}
                onFocus={() => {
                  if (shouldShowTooltip('post_price')) {
                    setActiveTooltip('post_price');
                  }
                }}
                placeholder="0.00" 
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad" 
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputGroup} ref={locationInputRef}>
            <View style={styles.labelRow}>
              <MapPin size={18} color={Colors.primary} />
              <Text style={styles.label}>Ville *</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput 
                style={[styles.input, { flex: 1 }]} 
                value={city} 
                onChangeText={setCity}
                onFocus={() => {
                  if (shouldShowTooltip('post_location')) {
                    setActiveTooltip('post_location');
                  }
                }}
                placeholder="Votre ville" 
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity 
                onPress={detectLocation}
                style={styles.locationButton}
                disabled={detectingLocation}
              >
                <Navigation size={20} color={detectingLocation ? '#94a3b8' : Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || !title || !category || !description || !price || images.length === 0) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !title || !category || !description || !price || images.length === 0}
          >
            <LinearGradient
              colors={
                (isSubmitting || !title || !category || !description || !price || images.length === 0)
                  ? ['#94a3b8', '#64748b']
                  : [Colors.primary, '#7da01a']
              }
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? '⏳ Publication en cours...' : "🚀 Publier l'annonce"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Category Modal */}
        <Modal visible={showCategoryModal} transparent animationType="slide" onRequestClose={() => setShowCategoryModal(false)}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderText}>
                  <Tag size={24} color={Colors.primary} />
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>Choisir une catégorie</Text>
                    <Text style={styles.modalSubtitle}>Sélectionnez la catégorie qui correspond le mieux</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCategoryModal(false)}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.categoryItem, category === item.value && styles.categoryItemSelected]}
                    onPress={() => handleCategorySelect(item.value)}
                  >
                    <Text style={[styles.categoryItemText, category === item.value && styles.categoryItemTextSelected]}>
                      {item.label}
                    </Text>
                    {category === item.value && (
                      <View style={styles.checkmarkContainer}>
                        <Check size={20} color={Colors.primary} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </ScrollView>

      {/* Pop-ups */}
      <Popup
        visible={showSuccessPopup}
        title="Annonce publiée !"
        message="Voir l'annonce ?"
        buttonText="Voir"
        onClose={() => setShowSuccessPopup(false)}
        onConfirm={() => {
          setShowSuccessPopup(false);
          newListingId && router.push(`/listing/${newListingId}`);
        }}
      />
      <Popup
        visible={showNoCreditsPopup}
        title="Crédits épuisés"
        message="Achetez-en pour continuer."
        buttonText="Acheter"
        onClose={() => setShowNoCreditsPopup(false)}
        onConfirm={() => {
          setShowNoCreditsPopup(false);
          router.push('/(tabs)/profile');
        }}
      />

      {/* Guidance Tooltips */}
      {activeTooltip && getTooltipContent(activeTooltip) && (
        <Tooltip
          content={getTooltipContent(activeTooltip)!}
          visible={true}
          onDismiss={() => {
            markTooltipDismissed(activeTooltip);
            setActiveTooltip(null);
          }}
          targetRef={
            activeTooltip === 'post_title' ? titleInputRef :
            activeTooltip === 'post_description' ? descriptionInputRef :
            activeTooltip === 'post_price' ? priceInputRef :
            activeTooltip === 'post_category' ? categoryButtonRef :
            activeTooltip === 'post_location' ? locationInputRef :
            activeTooltip === 'post_photo_tips' ? photosRef :
            undefined
          }
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  
  // Header styles (matching profile page)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logoImage: {
    width: 120,
    height: 36,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Message card styles
  messageContainer: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  messageCard: { 
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  messageIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  messageIcon: {
    fontSize: 40,
  },
  messageTitle: { 
    fontSize: 26, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: { 
    fontSize: 16, 
    color: '#64748b', 
    marginBottom: 32, 
    lineHeight: 24,
    textAlign: 'center',
  },
  modernActionButton: {
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modernActionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    alignItems: 'center',
  },

  // Form styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Add padding to prevent navbar overlap
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 32,
  },

  // Input styles
  inputGroup: { 
    marginBottom: 28 
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  label: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#1e293b' 
  },
  labelHint: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 10,
    lineHeight: 18,
  },
  inputContainer: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: 12, 
    paddingVertical: 14,
    paddingHorizontal: 16, 
    fontSize: 16, 
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    width: '100%',
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  textArea: { 
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  characterCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
  characterCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  characterCountWarning: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  validationHint: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },

  // Select styles
  selectContainer: {
    borderRadius: 12,
  },
  selectContent: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: 12, 
    paddingVertical: 14,
    paddingHorizontal: 16, 
    backgroundColor: '#f8fafc',
  },
  selectText: { 
    fontSize: 16, 
    color: '#1e293b', 
    flex: 1,
    fontWeight: '500',
  },
  selectPlaceholder: { 
    color: '#94a3b8',
    fontWeight: '400',
  },
  selectArrow: { 
    fontSize: 14, 
    color: '#64748b',
    fontWeight: '600',
  },

  // Image styles
  imageList: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12 
  },
  imageContainer: { 
    width: 100, 
    height: 100, 
    borderRadius: 12, 
    overflow: 'hidden', 
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  imagePreview: { 
    width: '100%', 
    height: '100%' 
  },
  removeButton: { 
    position: 'absolute', 
    top: 6, 
    right: 6, 
    width: 28, 
    height: 28, 
    borderRadius: 14,
  },
  removeButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  removeButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700' 
  },
  addImageButton: { 
    width: 100, 
    height: 100, 
    borderRadius: 12,
    borderWidth: 2, 
    borderColor: '#e2e8f0', 
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  addImageGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  addImageIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  addImageText: { 
    fontSize: 12, 
    color: '#64748b',
    fontWeight: '600',
  },

  // Button styles
  buttonText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '700' 
  },
  submitButton: {
    borderRadius: 16,
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: { 
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '700' 
  },

  // Modal styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end',
  },
  modalContent: { 
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  modalHeaderText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1e293b',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },

  // Category item styles
  categoryItem: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  categoryItemSelected: { 
    backgroundColor: '#f0fdf4' 
  },
  categoryItemText: { 
    fontSize: 16, 
    color: '#334155',
    fontWeight: '500',
  },
  categoryItemTextSelected: { 
    color: Colors.primary, 
    fontWeight: '600' 
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});