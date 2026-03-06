import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { ListingWithDetails, ListingCondition, Category } from '@/types/database';
import { useTranslation } from 'react-i18next';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isFrench = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().startsWith('fr');
  const txt = (fr: string, en: string) => (isFrench ? fr : en);
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
        Alert.alert(txt('Erreur', 'Error'), txt('Vous n\'avez pas la permission de modifier cette annonce.', 'You do not have permission to edit this listing.'));
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
      Alert.alert(txt('Erreur', 'Error'), txt('Impossible de charger l\'annonce.', 'Unable to load listing.'));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.category_id || !formData.condition || !formData.location) {
      Alert.alert(txt('Erreur', 'Error'), txt('Veuillez remplir tous les champs obligatoires.', 'Please fill in all required fields.'));
      return;
    }

    if (formData.images.length === 0) {
      Alert.alert(txt('Erreur', 'Error'), txt('Veuillez ajouter au moins une image.', 'Please add at least one image.'));
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
      Alert.alert(txt('Erreur', 'Error'), txt('Impossible de mettre à jour l\'annonce.', 'Unable to update listing.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text>{txt("Chargement des détails de l'annonce...", 'Loading listing details...')}</Text>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{txt('Annonce non trouvée.', 'Listing not found.')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView>
          <View style={styles.form}>
            <Text style={styles.label}>{txt('Titre *', 'Title *')}</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder={txt("Titre de l'annonce", 'Listing title')}
            />

            <Text style={styles.label}>{txt('Description', 'Description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder={txt("Description détaillée de l'article", 'Detailed item description')}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>{txt('Prix *', 'Price *')}</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(text) =>
                setFormData({ ...formData, price: text.replace(/[^0-9]/g, '') })
              }
              placeholder={txt('Prix en USD', 'Price in USD')}
              keyboardType="numeric"
            />

            <Text style={styles.label}>{txt('Catégorie *', 'Category *')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
                style={styles.picker}
              >
                <Picker.Item label={txt('Sélectionner une catégorie', 'Select a category')} value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>{txt('État *', 'Condition *')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.condition}
                onValueChange={(value) =>
                  setFormData({ ...formData, condition: value })
                }
                style={styles.picker}
              >
                <Picker.Item label={txt("Sélectionner l'état", 'Select condition')} value="" />
                <Picker.Item label={txt('Neuf', 'New')} value="new" />
                <Picker.Item label={txt('Comme neuf', 'Like new')} value="like_new" />
                <Picker.Item label={txt('Bon état', 'Good')} value="good" />
                <Picker.Item label={txt('État moyen', 'Fair')} value="fair" />
                <Picker.Item label={txt('À rénover', 'Needs repair')} value="poor" />
              </Picker>
            </View>

            <Text style={styles.label}>{txt('Localisation *', 'Location *')}</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
              placeholder={txt('Ex: Kinshasa, Gombe', 'e.g. Kinshasa, Gombe')}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                saving && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {txt('Enregistrer les modifications', 'Save changes')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});