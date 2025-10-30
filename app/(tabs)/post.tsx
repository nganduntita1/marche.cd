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
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, X, ChevronDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Category, ListingCondition } from '@/types/database';

export default function PostScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<ListingCondition>('good');
  const [imageUris, setImageUris] = useState<string[]>([]);
  // const [categories, setCategories] = useState<Category[]>([]);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadCategories();
    if (user?.location) {
      setLocation(user.location);
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const pickImage = async () => {
    if (imageUris.length >= 5) {
      Alert.alert('Limite atteinte', 'Vous pouvez ajouter jusqu\'à 5 images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUris([...imageUris, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImageUris(imageUris.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const uri of imageUris) {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const fileExt = uri.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('listings')
          .upload(fileName, blob, {
            contentType: `image/${fileExt}`,
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('listings')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrlData.publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    // Vérification détaillée des champs obligatoires
    const missingFields = [];
    if (!title) missingFields.push('titre');
    if (!description) missingFields.push('description');
    if (!price) missingFields.push('prix');
    if (!location) missingFields.push('localisation');
    if (!categoryId) missingFields.push('catégorie');
    
    if (missingFields.length > 0) {
      setError(`Veuillez remplir les champs obligatoires suivants: ${missingFields.join(', ')}`);
      return;
    }

    if (!user) {
      setError('Vous devez être connecté pour publier');
      return;
    }

    if (imageUris.length === 0) {
      setError('Veuillez ajouter au moins une image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadedImageUrls = await uploadImages();

      const { error: insertError } = await supabase.from('listings').insert({
        title,
        description,
        price: parseFloat(price),
        location,
        category_id: categoryId,
        condition,
        images: uploadedImageUrls,
        seller_id: user.id,
        status: 'active', // Auto-activate listings for better user experience
      });

      if (insertError) throw insertError;

      Alert.alert(
        'Succès',
        'Votre annonce a été publiée avec succès!',
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setDescription('');
              setPrice('');
              setLocation(user.location || '');
              setCategoryId('');
              setCondition('good');
              setImageUris([]);
              router.push('/(tabs)/profile');
            },
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  const [categories, setCategories] = useState<Category[]>([]);

  const conditions: { value: ListingCondition; label: string }[] = [
    { value: 'new', label: 'Neuf' },
    { value: 'like_new', label: 'Comme neuf' },
    { value: 'good', label: 'Bon état' },
    { value: 'fair', label: 'État correct' },
    { value: 'poor', label: 'À réparer' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Publier une annonce</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.imagesGrid}>
            {imageUris.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {imageUris.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Camera size={32} color="#94a3b8" />
                <Text style={styles.addImageText}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: iPhone 13 Pro Max 256GB"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              autoCapitalize="sentences"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez votre article en détail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix (CDF) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 500000"
              value={price}
              onChangeText={(text) => setPrice(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              returnKeyType="next"
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localisation *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Kinshasa, Gombe"
              value={location}
              onChangeText={setLocation}
              returnKeyType="next"
              autoCapitalize="words"
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
  <Text style={styles.label}>Catégorie *</Text>
  <TouchableOpacity
    style={[styles.input, styles.selectInput]}
    onPress={() => setCategoryPickerVisible(true)}
  >
    <Text style={categoryId ? styles.selectValueText : styles.selectPlaceholderText}>
      {categoryId ? (categories.find(c => c.id.toString() === categoryId.toString())?.name || 'Sélectionnez une catégorie') : 'Sélectionnez une catégorie'}
    </Text>
    <ChevronDown size={18} color="#64748b" />
  </TouchableOpacity>

  <Modal
    visible={categoryPickerVisible}
    animationType="slide"
    transparent
    onRequestClose={() => setCategoryPickerVisible(false)}
  >
    <TouchableOpacity 
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={() => setCategoryPickerVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalContent}
        activeOpacity={1}
        onPress={(e) => e.stopPropagation()}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Choisir une catégorie</Text>
          <TouchableOpacity onPress={() => setCategoryPickerVisible(false)}>
            <X size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalList}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.modalItem,
                categoryId && cat.id && categoryId.toString() === cat.id.toString() && { backgroundColor: '#f0fdf4', borderColor: '#16a34a' },
              ]}
              onPress={() => {
                setCategoryId(cat.id);
                setCategoryPickerVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={() => setCategoryPickerVisible(false)}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Fermer</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
</View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>État *</Text>
            <View style={styles.chipContainer}>
              {conditions.map(cond => (
                <TouchableOpacity
                  key={cond.value}
                  style={[
                    styles.chip,
                    condition === cond.value && styles.chipActive,
                  ]}
                  onPress={() => setCondition(cond.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      condition === cond.value && styles.chipTextActive,
                    ]}
                  >
                    {cond.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Publier l'annonce</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 40, // Ajoute plus d'espace en bas pour éviter que le contenu soit coupé
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
    width: '30%',
    aspectRatio: 1,
    marginBottom: 8,
    marginRight: '3%',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
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
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: '#0f172a',
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  selectValueText: {
    fontSize: 16,
    color: '#0f172a',
  },
  selectPlaceholderText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#16a34a',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  chipTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    width: '100%',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
});
