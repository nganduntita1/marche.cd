import React, { useState, useEffect } from 'react';
import {
View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

export default function EditProfileScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loadUserProfile } = useAuth();

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setProfilePicture(user.profile_picture || null);
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user?.id) return;

    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) {
        console.error('Storage upload error:', error);
        if (error.message.includes('Bucket not found')) {
          Alert.alert(
            'Configuration requise',
            'Le stockage des photos de profil n\'est pas encore configuré. Veuillez contacter l\'administrateur.'
          );
        } else {
          throw error;
        }
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      setProfilePicture(publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de télécharger l\'image. Veuillez réessayer.'
      );
    } finally {
      setUploading(false);
    }
  };

  const removeProfilePicture = () => {
    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer votre photo de profil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => setProfilePicture(null),
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erreur', 'Veuillez vous connecter');
      router.replace('/auth/login');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
          location: location.trim() || null,
          profile_picture: profilePicture,
        })
        .eq('id', user.id);

      if (error) throw error;

      await loadUserProfile(user.id);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      router.back();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier le profil</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profilePictureSection}>
            <View style={styles.avatarWrapper}>
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}

              <TouchableOpacity
                style={styles.cameraButton}
                onPress={pickImage}
                disabled={uploading}
              >
                <Camera size={20} color="#fff" />
              </TouchableOpacity>

              {profilePicture && !uploading && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={removeProfilePicture}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.pictureHint}>
              {profilePicture ? 'Appuyez pour changer' : 'Ajoutez une photo de profil'}
            </Text>
          </View>

          <View style={styles.formCard}>
            {user?.email?.includes('@marchecd.com') && (
              <View style={styles.generatedEmailInfo}>
                <Text style={styles.generatedEmailLabel}>Email de connexion généré</Text>
                <Text style={styles.generatedEmailValue}>{user.email}</Text>
                <Text style={styles.generatedEmailHint}>
                  Cet email a été créé automatiquement pour votre compte
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre nom"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <TextInput
                style={styles.input}
                placeholder="+243..."
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
              />
              <Text style={styles.hint}>
                Utilisé pour la connexion et les contacts
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ville</Text>
              <TextInput
                style={styles.input}
                placeholder="Kinshasa, Lubumbashi, etc."
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e2e8f0',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  pictureHint: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1e293b',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  generatedEmailInfo: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  generatedEmailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 6,
  },
  generatedEmailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 6,
  },
  generatedEmailHint: {
    fontSize: 12,
    color: '#0369a1',
    fontStyle: 'italic',
  },
  hint: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
