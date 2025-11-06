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
            // 1. Extract extension
            const ext = (uri.split('.').pop()?.split(/[\?\#]/)[0] ?? 'jpg').toLowerCase();
            const fileName = `${user.id}/${Date.now()}-${idx}.${ext}`;

            // 2. Fetch image as blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // 3. Upload to Supabase
            const { error: upErr } = await supabase.storage
              .from('listings')
              .upload(fileName, blob, {
                contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
                cacheControl: '3600',
                upsert: false,
              });
            if (upErr) throw new Error(`Erreur d'upload: ${upErr.message}`);

            // 4. Get public URL
            const { data: urlData } = supabase.storage
              .from('listings')
              .getPublicUrl(fileName);
            if (!urlData?.publicUrl) throw new Error('Impossible de récupérer l\'URL publique');
            return urlData.publicUrl;
          } catch (e: any) {
            console.error('Image upload error:', e);
            throw new Error(`Échec de l'upload de l'image ${idx + 1}: ${e.message}`);
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
      <View style={styles.container}>
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Connexion requise</Text>
          <Text style={styles.messageText}>Connectez-vous pour publier.</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/login')}>
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!user.phone || !user.location) {
    return (
      <View style={styles.container}>
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Profil incomplet</Text>
          <Text style={styles.messageText}>Complétez votre profil.</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/complete-profile')}>
            <Text style={styles.buttonText}>Compléter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
      </View>

      <ScrollView>
        <View style={styles.form}>
          <Text style={styles.title}>Publier une annonce</Text>

          {/* Images */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Images (max 5) *</Text>
            <View style={styles.imageList}>
              {images.map((uri, i) => (
                <View key={i} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(i)}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                  <Text style={styles.addImageButtonText}>+</Text>
                  <Text style={styles.addImageButtonText}>Ajouter</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="ex: iPhone 11" maxLength={100} />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie *</Text>
            <TouchableOpacity style={[styles.input, styles.select]} onPress={() => setShowCategoryModal(true)}>
              <Text style={[styles.selectText, !category && styles.selectPlaceholder]}>
                {category ? categories.find(c => c.value === category)?.label : 'Sélectionner'}
              </Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="État, caractéristiques..."
              multiline
              numberOfLines={4}
              maxLength={1000}
              textAlignVertical="top"
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix (USD) *</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.button,
              (isSubmitting || !title || !category || !description || !price || images.length === 0) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !title || !category || !description || !price || images.length === 0}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Publication...' : "Publier l'annonce"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Modal */}
        <Modal visible={showCategoryModal} transparent animationType="slide" onRequestClose={() => setShowCategoryModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Catégorie</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
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
                    <Text style={[styles.categoryItemText, category === item.value && styles.categoryItemTextSelected]}>
                      {item.label}
                    </Text>
                    {category === item.value && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
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

/* -------------------------------------------------------------------------- */
/* Styles (unchanged)                                                       */
/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#bedc39' },
  logoImage: { width: '100%', height: 64, borderRadius: 12, marginBottom: 8 },
  messageCard: { margin: 16, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#9bbd1f' },
  messageTitle: { fontSize: 18, fontWeight: '600', color: '#9bbd1f', marginBottom: 8 },
  messageText: { fontSize: 14, color: '#334155', marginBottom: 16, lineHeight: 20 },
  form: { padding: 16 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16, color: '#0f172a' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#334155' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, fontSize: 16, backgroundColor: '#fff' },
  textArea: { minHeight: 100 },
  select: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectText: { fontSize: 16, color: '#334155', flex: 1 },
  selectPlaceholder: { color: '#94a3b8' },
  selectArrow: { fontSize: 12, color: '#94a3b8' },
  imageList: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  imageContainer: { width: 100, height: 100, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  imagePreview: { width: '100%', height: '100%' },
  removeButton: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  removeButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  addImageButton: { width: 100, height: 100, borderRadius: 8, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  addImageButtonText: { fontSize: 20, color: '#94a3b8' },
  addImageHintText: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  button: { backgroundColor: '#9bbd1f', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a' },
  modalClose: { fontSize: 32, color: '#94a3b8', fontWeight: '300' },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  categoryItemSelected: { backgroundColor: '#f0fdf4' },
  categoryItemText: { fontSize: 16, color: '#334155' },
  categoryItemTextSelected: { color: '#9bbd1f', fontWeight: '500' },
  checkmark: { fontSize: 18, color: '#9bbd1f', fontWeight: '600' },
});