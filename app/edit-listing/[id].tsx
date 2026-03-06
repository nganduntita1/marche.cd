import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Camera, FileText, Tag, DollarSign, X, Check } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isFrench = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().startsWith('fr');
  const txt = (fr: string, en: string) => (isFrench ? fr : en);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          category:category_id(slug)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user owns this listing
      if (data.seller_id !== user?.id) {
        Alert.alert(txt('Erreur', 'Error'), txt('Vous ne pouvez pas modifier cette annonce', 'You cannot edit this listing'));
        router.back();
        return;
      }

      setTitle(data.title);
      setCategory(data.category?.slug || '');
      setDescription(data.description);
      setPrice(data.price.toString());
      setImages(data.images || []);
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert(txt('Erreur', 'Error'), txt('Impossible de charger l\'annonce', 'Unable to load listing'));
      router.back();
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async () => {
    if (!title || !category || !description || !price || images.length === 0) {
      Alert.alert(txt('Erreur', 'Error'), txt('Tous les champs et au moins une image sont requis.', 'All fields and at least one image are required.'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Get category ID
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      if (catErr) throw new Error(`${txt('Erreur catégorie', 'Category error')}: ${catErr.message}`);
      if (!catData) throw new Error(txt('Catégorie introuvable', 'Category not found'));

      // Upload new images (those that are local URIs)
      const imageUrls = await Promise.all(
        images.map(async (uri, idx) => {
          // If it's already a URL, keep it
          if (uri.startsWith('http')) {
            return uri;
          }

          // Upload new image
          try {
            const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${user!.id}/${Date.now()}-${idx}.${ext}`;
            const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

            let fileData: any;

            if (Platform.OS === 'web') {
              const response = await fetch(uri);
              fileData = await response.blob();
            } else {
              // React Native: use ArrayBuffer
              const response = await fetch(uri);
              fileData = await response.arrayBuffer();
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

      // Update listing
      const { error: updateErr } = await supabase
        .from('listings')
        .update({
          title,
          category_id: catData.id,
          description,
          price: parseFloat(price),
          images: imageUrls,
        })
        .eq('id', id);

      if (updateErr) throw new Error(`${txt('Erreur de mise à jour', 'Update error')}: ${updateErr.message}`);

      Alert.alert(txt('Succès', 'Success'), txt('Annonce mise à jour', 'Listing updated'), [
        {
          text: 'OK',
          onPress: () => router.push(`/listing/${id}`),
        },
      ]);
    } catch (err: any) {
      console.error('Submit error:', err);
      Alert.alert(txt('Erreur', 'Error'), err.message ?? txt('Mise à jour échouée.', 'Update failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{txt('Chargement...', 'Loading...')}</Text>
          </View>
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
          <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.formCard}>
          <Text style={styles.pageTitle}>{txt("Modifier l'annonce", 'Edit listing')}</Text>
          <Text style={styles.pageSubtitle}>{txt('Mettez à jour les informations de votre article', 'Update your item information')}</Text>

          {/* Images */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Camera size={18} color={Colors.primary} />
              <Text style={styles.label}>{txt('Images (max 5) *', 'Images (max 5) *')}</Text>
            </View>
            <Text style={styles.labelHint}>{txt("Ajoutez des photos de qualité pour attirer plus d'acheteurs", 'Add quality photos to attract more buyers')}</Text>
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
                    <Text style={styles.addImageText}>{txt('Ajouter', 'Add')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Title */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <FileText size={18} color={Colors.primary} />
              <Text style={styles.label}>{txt('Titre *', 'Title *')}</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input} 
                value={title} 
                onChangeText={setTitle} 
                placeholder={txt('ex: iPhone 11 Pro Max 256GB', 'e.g. iPhone 11 Pro Max 256GB')}
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
              <Text style={styles.label}>{txt('Catégorie *', 'Category *')}</Text>
            </View>
            <TouchableOpacity style={styles.selectContainer} onPress={() => setShowCategoryModal(true)}>
              <View style={styles.selectContent}>
                <Text style={[styles.selectText, !category && styles.selectPlaceholder]}>
                  {category ? categories.find(c => c.value === category)?.label : txt('Sélectionner une catégorie', 'Select a category')}
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <FileText size={18} color={Colors.primary} />
              <Text style={styles.label}>{txt('Description *', 'Description *')}</Text>
            </View>
            <Text style={styles.labelHint}>{txt("Décrivez l'état, les caractéristiques et les détails importants", 'Describe condition, features, and important details')}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder={txt('Décrivez votre article en détail...', 'Describe your item in detail...')}
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
              <Text style={styles.label}>{txt('Prix (USD) *', 'Price (USD) *')}</Text>
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
                {isSubmitting ? txt('⏳ Mise à jour en cours...', '⏳ Updating...') : txt('✓ Enregistrer les modifications', '✓ Save changes')}
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
                    <Text style={styles.modalTitle}>{txt('Choisir une catégorie', 'Choose a category')}</Text>
                    <Text style={styles.modalSubtitle}>{txt('Sélectionnez la catégorie qui correspond le mieux', 'Select the category that fits best')}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  
  // Header styles
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 42,
  },

  // Form styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  },
  textArea: { 
    minHeight: 120,
    textAlignVertical: 'top',
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
