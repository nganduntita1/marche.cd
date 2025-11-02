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
} from 'react-native';
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>Marché.cd</Text>
          <Text style={styles.tagline}>Complétez votre profil</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Informations supplémentaires</Text>
          <Text style={styles.subtitle}>
            Ces informations sont nécessaires pour poster des annonces
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro WhatsApp</Text>
            <TextInput
              style={styles.input}
              placeholder="+243..."
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ville</Text>
            <TextInput
              style={styles.input}
              placeholder="Kinshasa, Lubumbashi, etc."
              value={location}
              onChangeText={setLocation}
            />
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
            <Text style={styles.skipText}>Compléter plus tard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
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
  button: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    color: '#64748b',
    textDecorationLine: 'underline',
  },
});