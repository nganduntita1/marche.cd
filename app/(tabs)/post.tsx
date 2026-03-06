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
      quality: 0.8,
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
      console.log('Could not detect location:', error);
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
    if (!user?.phone || !user?.location) {
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

    if (!title || !category || !description || !price || images.length === 0) {
      Alert.alert(txt('Erreur', 'Error'), txt('Tous les champs et au moins une image sont requis.', 'All fields and at least one image are required.'));
      return;
    }

    setIsSubmitting(true);

    try {
      // ---------- Credits ----------
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
      if (userErr) throw new Error(`${txt('Erreur lors de la vérification des crédits', 'Error while checking credits')}: ${userErr.message}`);
      if (!userData || userData.credits <= 0) {
        setShowNoCreditsPopup(true);
        setIsSubmitting(false);
        return;
      }

      // ---------- Category ----------
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      if (catErr) throw new Error(`${txt('Erreur catégorie', 'Category error')}: ${catErr.message}`);
      if (!catData) throw new Error(txt('Catégorie introuvable', 'Category not found'));

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

      // Helper function to get proper MIME type
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

      // ---------- IMAGE UPLOAD ----------
      const imageUrls = await Promise.all(
        images.map(async (uri, idx) => {
          try {
            const imageMeta = imageMetaMap[uri];
            const ext = sanitizeExtension(
              extensionFromFileName(imageMeta?.fileName) ||
              extensionFromMimeType(imageMeta?.mimeType) ||
              extensionFromUri(uri)
            );
            const fileName = `${user.id}/${Date.now()}-${idx}.${ext}`;
            let mimeType = getMimeType(ext, imageMeta?.mimeType);

            console.log(`Uploading image ${idx + 1}: ${fileName}`);

            let fileData: any;

            if (Platform.OS === 'web') {
              // Web: use fetch to get blob
              const response = await fetch(uri);
              const blob = await response.blob();
              fileData = blob;
              if (!imageMeta?.mimeType && blob.type) {
                mimeType = blob.type;
              }
            } else {
              // React Native: use ArrayBuffer approach
              const response = await fetch(uri);
              const arrayBuffer = await response.arrayBuffer();
              fileData = arrayBuffer;
            }

            const { error: uploadError } = await supabase.storage
              .from('listings')
              .upload(fileName, fileData, {
                contentType: mimeType,
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              console.error('Upload error:', uploadError);
              throw uploadError;
            }

            const { data: urlData } = supabase.storage
              .from('listings')
              .getPublicUrl(fileName);

            console.log(`Image ${idx + 1} uploaded successfully`);
            return urlData.publicUrl;
          } catch (error: any) {
            console.error(`Image ${idx + 1} upload error:`, error);
            throw new Error(`${txt("Échec du téléchargement de l'image", 'Image upload failed')} ${idx + 1}: ${error.message}`);
          }
        })
      );

      // ---------- INSERT LISTING ----------
      const { data: listing, error: insErr } = await supabase
        .from('listings')
        .insert({
          seller_id: user.id,
          title,
          category_id: catData.id,
          description,
          price: parseFloat(price),
          images: imageUrls,
          status: 'active',
          location: user.location,
          latitude,
          longitude,
          city: city || currentCity || user.location,
          country: 'Congo (RDC)',
        })
        .select()
        .single();
      if (insErr) throw new Error(`${txt("Erreur d'insertion", 'Insert error')}: ${insErr.message}`);

      // ---------- DEDUCT CREDIT ----------
      const { error: credErr } = await supabase
        .from('users')
        .update({ credits: userData.credits - 1 })
        .eq('id', user.id);
      if (credErr) throw new Error(`${txt('Erreur de déduction de crédit', 'Credit deduction error')}: ${credErr.message}`);

      setNewListingId(listing.id);
      
      // Mark first listing action as completed
      await markActionCompleted('first_listing_posted');
      
      // Trigger success celebration if this is the first listing
      if (guidanceRef.current?.triggerSuccessCelebration) {
        guidanceRef.current.triggerSuccessCelebration();
      }
      
      setShowSuccessPopup(true);
      resetForm();
    } catch (err: any) {
      console.error('Submit error:', err);
      Alert.alert(txt('Erreur', 'Error'), err.message ?? txt('Publication échouée.', 'Publishing failed.'));
    } finally {
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
            <Text style={styles.characterCount}>{title.length}/100</Text>
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
            <Text style={styles.labelHint}>Décrivez l'état, les caractéristiques et les détails importants</Text>
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
            <Text style={styles.characterCount}>{description.length}/1000</Text>
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