import React, { useState } from 'react';
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

export default function PostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { userLocation, currentCity } = useLocation();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
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

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setDescription('');
    setPrice('');
    setImages([]);
    setNewListingId(null);
  };

  const categories = [
    { label: 'Téléphones', value: 'telephones' },
    { label: 'Véhicules', value: 'vehicules' },
    { label: 'Électronique', value: 'electronique' },
    { label: 'Maison & Jardin', value: 'maison-jardin' },
    { label: 'Mode & Beauté', value: 'mode-beaute' },
    { label: 'Emplois', value: 'emplois' },
    { label: 'Services', value: 'services' },
    { label: 'Immobilier', value: 'immobilier' },
    { label: 'Autre', value: 'autre' },
  ];

  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert('Maximum 5 images', 'Vous ne pouvez pas ajouter plus de 5 images.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès à la bibliothèque de photos requis.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

  // Auto-detect location on mount
  React.useEffect(() => {
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
        'Profil incomplet',
        'Complétez votre numéro WhatsApp et votre ville.',
        [
          { text: 'Compléter', onPress: () => router.push('/auth/complete-profile') },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
      return;
    }

    if (!title || !category || !description || !price || images.length === 0) {
      Alert.alert('Erreur', 'Tous les champs et au moins une image sont requis.');
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
      if (userErr) throw new Error(`Erreur lors de la vérification des crédits: ${userErr.message}`);
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
      if (catErr) throw new Error(`Erreur catégorie: ${catErr.message}`);
      if (!catData) throw new Error('Catégorie introuvable');

      // Helper function to get proper MIME type
      const getMimeType = (uri: string): string => {
        const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeTypes: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
        };
        return mimeTypes[extension] || 'image/jpeg';
      };

      // ---------- IMAGE UPLOAD ----------
      const imageUrls = await Promise.all(
        images.map(async (uri, idx) => {
          try {
            const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${user.id}/${Date.now()}-${idx}.${ext}`;
            const mimeType = getMimeType(uri);

            console.log(`Uploading image ${idx + 1}: ${fileName}`);

            let fileData: any;

            if (Platform.OS === 'web') {
              // Web: use fetch to get blob
              const response = await fetch(uri);
              fileData = await response.blob();
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
            throw new Error(`Échec du téléchargement de l'image ${idx + 1}: ${error.message}`);
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
      if (insErr) throw new Error(`Erreur d'insertion: ${insErr.message}`);

      // ---------- DEDUCT CREDIT ----------
      const { error: credErr } = await supabase
        .from('users')
        .update({ credits: userData.credits - 1 })
        .eq('id', user.id);
      if (credErr) throw new Error(`Erreur de déduction de crédit: ${credErr.message}`);

      setNewListingId(listing.id);
      setShowSuccessPopup(true);
      resetForm();
    } catch (err: any) {
      console.error('Submit error:', err);
      Alert.alert('Erreur', err.message ?? 'Publication échouée.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // UI (unchanged)
  // -------------------------------------------------------------------------
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
              <Text style={styles.messageTitle}>Connexion requise</Text>
              <Text style={styles.messageText}>Connectez-vous pour publier vos annonces et commencer à vendre.</Text>
              <TouchableOpacity style={styles.modernActionButton} onPress={() => router.push('/auth/login')}>
                <LinearGradient
                  colors={[Colors.primary, '#7da01a']}
                  style={styles.modernActionButtonGradient}
                >
                  <Text style={styles.buttonText}>Se connecter</Text>
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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

          {/* Images */}
          <View style={styles.inputGroup}>
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
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <FileText size={18} color={Colors.primary} />
              <Text style={styles.label}>Titre *</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input} 
                value={title} 
                onChangeText={setTitle} 
                placeholder="ex: iPhone 11 Pro Max 256GB" 
                placeholderTextColor="#94a3b8"
                maxLength={100} 
              />
            </View>
            <Text style={styles.characterCount}>{title.length}/100</Text>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Tag size={18} color={Colors.primary} />
              <Text style={styles.label}>Catégorie *</Text>
            </View>
            <TouchableOpacity style={styles.selectContainer} onPress={() => setShowCategoryModal(true)}>
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
          <View style={styles.inputGroup}>
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
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <DollarSign size={18} color={Colors.primary} />
              <Text style={styles.label}>Prix (USD) *</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input} 
                value={price} 
                onChangeText={setPrice} 
                placeholder="0.00" 
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad" 
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <MapPin size={18} color={Colors.primary} />
              <Text style={styles.label}>Ville *</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput 
                style={[styles.input, { flex: 1 }]} 
                value={city} 
                onChangeText={setCity} 
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
    paddingBottom: 100, // Add padding to prevent navbar overlap
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