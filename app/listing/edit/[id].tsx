import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ListingWithDetails, ListingCondition, Category } from '@/types/database';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [listing, setListing] = useState<ListingWithDetails | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    condition: '' as ListingCondition,
    location: '',
    images: [] as string[],
  });

  useEffect(() => {
    loadListing();
    loadCategories();
  }, []);

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

  const loadListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          seller:seller_id(*),
          category:category_id(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data.seller_id !== user?.id) {
        Alert.alert('Erreur', 'Vous n\'avez pas la permission de modifier cette annonce.');
        router.back();
        return;
      }

      setListing(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        price: data.price.toString(),
        category_id: data.category_id,
        condition: data.condition,
        location: data.location,
        images: data.images,
      });
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'annonce.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.category_id || !formData.condition || !formData.location) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (formData.images.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins une image.');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('listings')
        .update({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: formData.category_id,
          condition: formData.condition,
          location: formData.location,
          images: formData.images,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      router.back();
    } catch (error) {
      console.error('Error updating listing:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'annonce.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholder="Titre de l'annonce"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Description détaillée de l'article"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Prix *</Text>
        <TextInput
          style={styles.input}
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text.replace(/[^0-9]/g, '') })}
          placeholder="Prix en USD"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Catégorie *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            style={styles.picker}
          >
            <Picker.Item label="Sélectionner une catégorie" value="" />
            {categories.map((category) => (
              <Picker.Item
                key={category.id}
                label={category.name}
                value={category.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>État *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.condition}
            onValueChange={(value) => setFormData({ ...formData, condition: value })}
            style={styles.picker}
          >
            <Picker.Item label="Sélectionner l'état" value="" />
            <Picker.Item label="Neuf" value="new" />
            <Picker.Item label="Comme neuf" value="like_new" />
            <Picker.Item label="Bon état" value="good" />
            <Picker.Item label="État moyen" value="fair" />
            <Picker.Item label="À rénover" value="poor" />
          </Picker>
        </View>

        <Text style={styles.label}>Localisation *</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
          placeholder="Ex: Kinshasa, Gombe"
        />

        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Enregistrer les modifications</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#334155',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});