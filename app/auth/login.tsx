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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.tagline}>Achetez et vendez localement</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Connexion</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={styles.linkText}>
                Pas de compte? <Text style={styles.linkBold}>Créer un compte</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 16,
    },
    header: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logoImage: {
      width: '100%',
      height: 64,
      borderRadius: 12,
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
      marginBottom: 16,
      color: '#0f172a',
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
      padding: 8,
      fontSize: 16,
      backgroundColor: '#fff',
    },
    button: {
      backgroundColor: '#9bbd1f',
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
    linkButton: {
      marginTop: 16,
      alignItems: 'center',
    },
    linkText: {
      fontSize: 14,
      color: '#64748b',
    },
    linkBold: {
      color: '#9bbd1f',
      fontWeight: '600',
    },
    errorContainer: {
      backgroundColor: '#fef2f2',
      padding: 8,
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
