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
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#bedc39', '#9bbd1f']}
          style={styles.header}
        >
          <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.tagline}>Complétez votre profil</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>✨</Text>
          </View>
          
          <Text style={styles.title}>Informations supplémentaires</Text>
          <Text style={styles.subtitle}>
            Ces informations sont nécessaires pour poster des annonces
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>📱 Numéro WhatsApp</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="+243..."
                value={whatsapp}
                onChangeText={setWhatsapp}
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>📍 Ville</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Kinshasa, Lubumbashi, etc."
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#94a3b8', '#64748b'] : ['#9bbd1f', '#7da01a']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {loading ? '⏳ Enregistrement...' : '🚀 Compléter mon profil'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.skipText}>⏭️ Compléter plus tard</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  logoImage: {
    width: '100%',
    height: 64,
    borderRadius: 12,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
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
  button: {
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
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
    fontWeight: '700',
  },
  skipButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
});