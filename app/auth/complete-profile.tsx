import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Phone, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

export default function CompleteProfileScreen() {
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loadUserProfile } = useAuth();

  const handleComplete = async () => {
    if (!whatsapp || !location) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
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
          phone: whatsapp,
          location: location,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Reload user profile to get updated data
      await loadUserProfile(user.id);
      
      // Navigate to home page
      router.replace('/(tabs)');
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['#60c882', Colors.primary, '#c7f9cc', '#00a85d', '#60c882']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0, 0.25, 0.5, 0.75, 1]}
            style={styles.gradientHeader}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'transparent', 'rgba(255, 255, 255, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.meshOverlay}
            >
              <Image 
                source={require('@/assets/images/logo.png')} 
                style={styles.logo} 
                resizeMode="contain" 
              />
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Complétez votre profil</Text>
              </View>
              <Text style={styles.subtitle}>
                Ajoutez vos informations pour commencer à vendre sur Marche CD
              </Text>
            </LinearGradient>
          </LinearGradient>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro WhatsApp</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="+243..."
                  placeholderTextColor="#94a3b8"
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  keyboardType="phone-pad"
                />
                <View style={styles.inputIcon}>
                  <Phone size={20} color="#64748b" />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ville</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Kinshasa, Lubumbashi, etc."
                  placeholderTextColor="#94a3b8"
                  value={location}
                  onChangeText={setLocation}
                />
                <View style={styles.inputIcon}>
                  <MapPin size={20} color="#64748b" />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleComplete}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Enregistrement...' : 'Compléter mon profil'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.skipText}>Passer pour l'instant</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  gradientHeader: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  meshOverlay: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
  },
  logo: {
    width: 180,
    height: 56,
    marginBottom: 32,
  },
  welcomeContainer: {
    marginBottom: 16,
  },
  welcomeText: {
    ...TextStyles.h4,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  subtitle: {
    ...TextStyles.body,
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
    opacity: 0.85,
  },
  form: {
    padding: 24,
    paddingTop: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1e293b',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    paddingRight: 56,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    ...TextStyles.button,
    fontSize: 17,
    fontWeight: '700',
  },
  skipButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    ...TextStyles.body,
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
});