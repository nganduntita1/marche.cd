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
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';
import Popup from '@/components/Popup';

export default function PostScreen() {
  const { user } = useAuth();
  const router = useRouter();
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

      // ---------- IMAGE UPLOAD ----------
      const imageUrls = await Promise.all(
        images.map(async (uri, idx) => {
          try {
            const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${user.id}/${Date.now()}-${idx}.${ext}`;

            // Read file as base64
            const base64 = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });

            // Convert base64 to array buffer
            const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

            const { error: uploadError } = await supabase.storage
              .from('listings')
              .upload(fileName, arrayBuffer, {
                contentType: `image/${ext}`,
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from('listings')
              .getPublicUrl(fileName);

            return urlData.publicUrl;
          } catch (error: any) {
            console.error('Image upload error:', error);
            throw new Error(`Failed to upload image ${idx + 1}: ${error.message}`);
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
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gradientHeader}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
            {/* <Text style={styles.headerTitle}>Publier une annonce</Text> */}
          </View>
          
          <View style={styles.messageContainer}>
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>Connexion requise</Text>
              <Text style={styles.messageText}>Connectez-vous pour publier vos annonces et commencer à vendre.</Text>
              <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/login')}>
                <Text style={styles.buttonText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!user.phone || !user.location) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gradientHeader}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
            {/* <Text style={styles.headerTitle}>Publier une annonce</Text> */}
          </View>
          
          <View style={styles.messageContainer}>
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>Profil incomplet</Text>
              <Text style={styles.messageText}>Complétez votre profil avec votre numéro WhatsApp et votre ville pour publier des annonces.</Text>
              <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/complete-profile')}>
                <Text style={styles.buttonText}>Compléter mon profil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gradientHeader}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
          {/* <Text style={styles.headerTitle}>Publier une annonce</Text> */}
        </View>
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={styles.formIconContainer}>
              <Text style={styles.formIcon}>📝</Text>
            </View>
            <Text style={styles.formTitle}>Créer votre annonce</Text>
            <Text style={styles.formSubtitle}>Remplissez tous les champs pour publier votre annonce</Text>
          </View>

          {/* Images */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📸 Images (max 5) *</Text>
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
            <Text style={styles.label}>📋 Titre *</Text>
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
            <Text style={styles.label}>🏷️ Catégorie *</Text>
            <TouchableOpacity style={styles.selectContainer} onPress={() => setShowCategoryModal(true)}>
              <View style={styles.selectContent}>
                <Text style={[styles.selectText, !category && styles.selectPlaceholder]}>
                  {category ? categories.find(c => c.value === category)?.label : 'Sélectionner une catégorie'}
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📄 Description *</Text>
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
            <Text style={styles.label}>💰 Prix (USD) *</Text>
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
                  : ['#9bbd1f', '#7da01a']
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>🏷️ Choisir une catégorie</Text>
                    <Text style={styles.modalSubtitle}>Sélectionnez la catégorie qui correspond le mieux à votre article</Text>
                  </View>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCategoryModal(false)}>
                    <Text style={styles.modalClose}>×</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={categories}
                  keyExtractor={i => i.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.categoryItem, category === item.value && styles.categoryItemSelected]}
                      onPress={() => handleCategorySelect(item.value)}
                    >
                      <View style={styles.categoryItemContent}>
                        <Text style={[styles.categoryItemText, category === item.value && styles.categoryItemTextSelected]}>
                          {item.label}
                        </Text>
                        {category === item.value && (
                          <View style={styles.checkmarkContainer}>
                            <LinearGradient
                              colors={['#9bbd1f', '#7da01a']}
                              style={styles.checkmarkGradient}
                            >
                              <Text style={styles.checkmark}>✓</Text>
                            </LinearGradient>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </LinearGradient>
            </View>
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  
  // Header styles
  gradientHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#bedc39',
  },
  logoImage: { 
    width: '100%', 
    height: 64, 
    borderRadius: 12, 
    marginBottom: 12 
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Message card styles
  messageContainer: {
    padding: 20,
    minHeight: 400,
    justifyContent: 'center',
  },
  messageCard: { 
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 32,
  },
  messageTitle: { 
    fontSize: 24, 
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

  // Form styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding to prevent navbar overlap
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  formIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  formIcon: {
    fontSize: 24,
  },
  formTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Input styles
  inputGroup: { 
    marginBottom: 24 
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 8, 
    color: '#1e293b' 
  },
  labelHint: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  inputContainer: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: { 
    borderWidth: 2, 
    borderColor: '#e2e8f0', 
    borderRadius: 12, 
    paddingVertical: 16,
    paddingHorizontal: 20, 
    fontSize: 16, 
    backgroundColor: '#fff',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectContent: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 2, 
    borderColor: '#e2e8f0', 
    borderRadius: 12, 
    paddingVertical: 16,
    paddingHorizontal: 20, 
    backgroundColor: '#fff',
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
  modernButton: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700' 
  },
  submitButton: {
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: { 
    shadowOpacity: 0.05,
    elevation: 2,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700' 
  },

  // Modal styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: { 
    borderRadius: 24, 
    maxHeight: '80%',
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalGradient: {
    paddingBottom: 20,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0' 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1e293b',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClose: { 
    fontSize: 24, 
    color: '#64748b', 
    fontWeight: '400' 
  },

  // Category item styles
  categoryItem: { 
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  categoryItemSelected: { 
    backgroundColor: '#f0fdf4' 
  },
  categoryItemContent: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  categoryItemText: { 
    fontSize: 16, 
    color: '#334155',
    fontWeight: '500',
  },
  categoryItemTextSelected: { 
    color: '#1e293b', 
    fontWeight: '600' 
  },
  checkmarkContainer: {
    borderRadius: 12,
  },
  checkmarkGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { 
    fontSize: 14, 
    color: '#fff', 
    fontWeight: '700' 
  },

  // Button styles
  button: {
    backgroundColor: '#9bbd1f',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});