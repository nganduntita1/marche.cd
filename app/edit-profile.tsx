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
import { Camera, X, HelpCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useGuidance } from '@/contexts/GuidanceContext';
import { Tooltip, ProfilePhotoTips } from '@/components/guidance';
import { useTranslation } from 'react-i18next';

export default function EditProfileScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPhotoTips, setShowPhotoTips] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const router = useRouter();
  const { user, loadUserProfile } = useAuth();
  const { i18n } = useTranslation();
  const isFrench = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().startsWith('fr');
  const txt = (fr: string, en: string) => (isFrench ? fr : en);
  const { shouldShowTooltip, markTooltipDismissed, getTooltipContent } = useGuidance();

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
      Alert.alert(txt('Permission requise', 'Permission required'), txt('Nous avons besoin de votre permission pour accéder à vos photos.', 'We need your permission to access your photos.'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const mimeType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

      let fileData: any;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileData = await response.blob();
      } else {
        // React Native: use ArrayBuffer
        const response = await fetch(uri);
        fileData = await response.arrayBuffer();
      }

      const { error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, fileData, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.error('Storage upload error:', error);
        if (error.message.includes('Bucket not found')) {
          Alert.alert(
            txt('Configuration requise', 'Setup required'),
            txt('Le stockage des photos de profil n\'est pas encore configuré. Veuillez contacter l\'administrateur.', 'Profile photo storage is not configured yet. Please contact the administrator.')
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
      console.log('Profile picture uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert(
        txt('Erreur', 'Error'),
        error.message || txt('Impossible de télécharger l\'image. Veuillez réessayer.', 'Unable to upload the image. Please try again.')
      );
    } finally {
      setUploading(false);
    }
  };

  const removeProfilePicture = () => {
    Alert.alert(
      txt('Supprimer la photo', 'Remove photo'),
      txt('Êtes-vous sûr de vouloir supprimer votre photo de profil ?', 'Are you sure you want to remove your profile photo?'),
      [
        { text: txt('Annuler', 'Cancel'), style: 'cancel' },
        {
          text: txt('Supprimer', 'Remove'),
          style: 'destructive',
          onPress: () => setProfilePicture(null),
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(txt('Erreur', 'Error'), txt('Le nom est requis', 'Name is required'));
      return;
    }

    if (!user?.id) {
      Alert.alert(txt('Erreur', 'Error'), txt('Veuillez vous connecter', 'Please sign in'));
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
      Alert.alert(txt('Succès', 'Success'), txt('Profil mis à jour avec succès', 'Profile updated successfully'));
      router.back();
    } catch (error: any) {
      Alert.alert(txt('Erreur', 'Error'), error.message || txt('Erreur lors de la mise à jour du profil', 'Error updating profile'));
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
          <Text style={styles.headerTitle}>{txt('Modifier le profil', 'Edit profile')}</Text>
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
              {profilePicture ? txt('Appuyez pour changer', 'Tap to change') : txt('Ajoutez une photo de profil', 'Add a profile photo')}
            </Text>
            <TouchableOpacity
              style={styles.photoTipsButton}
              onPress={() => setShowPhotoTips(true)}
            >
              <HelpCircle size={16} color={Colors.primary} />
              <Text style={styles.photoTipsText}>{txt('Conseils pour une bonne photo', 'Tips for a good photo')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            {user?.email?.includes('@marchecd.com') && (
              <View style={styles.generatedEmailInfo}>
                <Text style={styles.generatedEmailLabel}>Email de connexion généré</Text>
                <Text style={styles.generatedEmailValue}>{user.email}</Text>
                <Text style={styles.generatedEmailHint}>
                  {txt('Cet email a été créé automatiquement pour votre compte', 'This email was generated automatically for your account')}
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{txt('Nom complet *', 'Full name *')}</Text>
                <TouchableOpacity
                  onPress={() => setActiveTooltip('edit_profile_name')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <HelpCircle size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder={txt('Votre nom', 'Your name')}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{txt('Numéro de téléphone', 'Phone number')}</Text>
                <TouchableOpacity
                  onPress={() => setActiveTooltip('edit_profile_phone')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <HelpCircle size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="+243..."
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
              />
              <Text style={styles.hint}>
                {txt('Utilisé pour la connexion et les contacts', 'Used for sign in and contacts')}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{txt('Ville', 'City')}</Text>
                <TouchableOpacity
                  onPress={() => setActiveTooltip('edit_profile_location')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <HelpCircle size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
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
                {loading ? txt('Enregistrement...', 'Saving...') : txt('Enregistrer', 'Save')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>{txt('Annuler', 'Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Profile Photo Tips Modal */}
      <ProfilePhotoTips
        visible={showPhotoTips}
        onDismiss={() => setShowPhotoTips(false)}
      />

      {/* Field Tooltips */}
      {activeTooltip === 'edit_profile_name' && (
        <Tooltip
          content={{
            id: 'edit_profile_name',
            title: 'Votre nom',
            message: 'Utilisez votre vrai nom pour inspirer confiance. Les acheteurs et vendeurs préfèrent savoir avec qui ils traitent.',
            placement: 'bottom',
            icon: '👤',
            dismissLabel: 'Compris',
          }}
          visible={true}
          onDismiss={() => setActiveTooltip(null)}
        />
      )}

      {activeTooltip === 'edit_profile_phone' && (
        <Tooltip
          content={{
            id: 'edit_profile_phone',
            title: 'Numéro de téléphone',
            message: 'Votre numéro est essentiel pour que les acheteurs puissent vous contacter. Assurez-vous qu\'il est correct et actif.',
            placement: 'bottom',
            icon: '📞',
            dismissLabel: 'Compris',
          }}
          visible={true}
          onDismiss={() => setActiveTooltip(null)}
        />
      )}

      {activeTooltip === 'edit_profile_location' && (
        <Tooltip
          content={{
            id: 'edit_profile_location',
            title: 'Votre ville',
            message: 'Indiquer votre ville aide les acheteurs à trouver des articles près d\'eux et facilite les rencontres.',
            placement: 'bottom',
            icon: '📍',
            dismissLabel: 'Compris',
          }}
          visible={true}
          onDismiss={() => setActiveTooltip(null)}
        />
      )}
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
  photoTipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  photoTipsText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
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
