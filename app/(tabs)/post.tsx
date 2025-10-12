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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, X } from 'lucide-react-native';
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
  const [categories, setCategories] = useState<Category[]>([]);
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
    if (!title || !description || !price || !location || !categoryId) {
      setError('Veuillez remplir tous les champs obligatoires');
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
        status: 'pending',
      });

      if (insertError) throw insertError;

      Alert.alert(
        'Succès',
        'Votre annonce a été soumise et sera publiée après modération',
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
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix (CDF) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 500000"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localisation *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Kinshasa, Gombe"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie *</Text>
            <View style={styles.chipContainer}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    categoryId === cat.id && styles.chipActive,
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      categoryId === cat.id && styles.chipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    width: 100,
    height: 100,
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
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
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
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
