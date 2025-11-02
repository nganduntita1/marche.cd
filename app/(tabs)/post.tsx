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
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';

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

  const categories = [
    { label: 'Téléphones', value: 'telephones' },
    { label: 'Véhicules', value: 'vehicules' },
    { label: 'Électronique', value: 'electronique' },
    { label: 'Maison & Jardin', value: 'maison-jardin' },
    { label: 'Mode & Beauté', value: 'mode-beaute' },
    { label: 'Emplois', value: 'emplois' },
    { label: 'Services', value: 'services' },
    { label: 'Immobilier', value: 'immobilier' }
  ];

  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert('Maximum 5 images', 'Vous ne pouvez pas ajouter plus de 5 images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCategorySelect = (value: string) => {
    setCategory(value);
    setShowCategoryModal(false);
  };

  const uploadImage = async (uri: string, index: number) => {
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
      
      let fileData;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileData = await response.blob();
      } else {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        fileData = new Blob([byteArray], { type: `image/${fileExt}` });
      }

      const { data, error } = await supabase.storage
        .from('listings')
        .upload(fileName, fileData, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('listings')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!user?.phone || !user?.location) {
      Alert.alert(
        'Profil incomplet',
        'Veuillez compléter votre profil avec votre numéro WhatsApp et votre ville avant de publier une annonce.',
        [
          {
            text: 'Compléter le profil',
            onPress: () => router.push('/auth/complete-profile'),
          },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
      return;
    }

    if (!title || !category || !description || !price || images.length === 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et ajouter au moins une image.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Récupérer l'ID de la catégorie
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (categoryError) throw categoryError;
      if (!categoryData) throw new Error('Catégorie non trouvée');

      const imageUrls = await Promise.all(
        images.map(async (uri, index) => {
          try {
            const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
            
            let fileData;
            if (Platform.OS === 'web') {
              const response = await fetch(uri);
              fileData = await response.blob();
            } else {
              const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              const byteCharacters = atob(base64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              fileData = new Blob([byteArray], { type: `image/${fileExt}` });
            }

            const { data, error } = await supabase.storage
              .from('listings')
              .upload(fileName, fileData, {
                contentType: `image/${fileExt}`,
                cacheControl: '3600',
                upsert: false,
              });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
              .from('listings')
              .getPublicUrl(fileName);

            return publicUrl;
          } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
          }
        })
      );

      const { data, error } = await supabase
        .from('listings')
        .insert({
          seller_id: user.id,
          title,
          category_id: categoryData.id,
          description,
          price: parseFloat(price),
          images: imageUrls,
          status: 'active',
          location: user.location,
        })
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Succès', 'Votre annonce a été publiée avec succès !');
      router.push('/profile');
    } catch (error) {
      console.error('Error submitting listing:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la publication de votre annonce. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            Connexion requise
          </Text>
          <Text style={styles.messageText}>
            Pour publier une annonce, vous devez d'abord vous connecter.
          </Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/auth/login')}
          >
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
          <Text style={styles.messageTitle}>
            Profil incomplet
          </Text>
          <Text style={styles.messageText}>
            Pour publier une annonce, vous devez d'abord compléter votre profil
            avec votre numéro WhatsApp et votre ville.
          </Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/auth/complete-profile')}
          >
            <Text style={styles.buttonText}>Compléter le profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Publier une annonce</Text>

        {/* Images First */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Images (max 5) *</Text>
          <View style={styles.imageList}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={pickImages}
              >
                <Text style={styles.addImageButtonText}>+</Text>
                <Text style={styles.addImageHintText}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Titre de l'annonce *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Titre ex: iPhone 11"
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catégorie *</Text>
          <TouchableOpacity
            style={[styles.input, styles.select]}
            onPress={() => setShowCategoryModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.selectText,
              !category && styles.selectPlaceholder
            ]}>
              {category
                ? categories.find(cat => cat.value === category)?.label
                : 'Sélectionnez une catégorie'}
            </Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez votre article (état, caractéristiques, etc.)"
            multiline
            numberOfLines={4}
            maxLength={1000}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prix (en USD) *</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (isSubmitting || !title || !category || !description || !price || images.length === 0) && styles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !title || !category || !description || !price || images.length === 0}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Publication en cours...' : 'Publier l\'annonce'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez une catégorie</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    category === item.value && styles.categoryItemSelected
                  ]}
                  onPress={() => handleCategorySelect(item.value)}
                >
                  <Text style={[
                    styles.categoryItemText,
                    category === item.value && styles.categoryItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                  {category === item.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageCard: {
    margin: 24,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#0f172a',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
  },
  select: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#334155',
    flex: 1,
  },
  selectPlaceholder: {
    color: '#94a3b8',
  },
  selectArrow: {
    fontSize: 12,
    color: '#94a3b8',
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  addImageButtonText: {
    fontSize: 32,
    color: '#94a3b8',
  },
  addImageHintText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  modalClose: {
    fontSize: 32,
    color: '#94a3b8',
    fontWeight: '300',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryItemSelected: {
    backgroundColor: '#f0fdf4',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#334155',
  },
  categoryItemTextSelected: {
    color: '#16a34a',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    color: '#16a34a',
    fontWeight: '600',
  },
});