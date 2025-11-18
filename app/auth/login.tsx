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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
                <Text style={styles.welcomeText}>Bienvenue sur</Text>
              </View>
              <Text style={styles.subtitle}>
                Votre marketplace local pour acheter et vendre au Congo
              </Text>
            </LinearGradient>
          </LinearGradient>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.inputIcon}>
                  <Mail size={20} color="#64748b" />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.inputIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#64748b" />
                  ) : (
                    <Eye size={20} color="#64748b" />
                  )}
                </TouchableOpacity>
              </View>
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
                Pas de compte ? <Text style={styles.linkBold}>Créer un compte</Text>
              </Text>
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
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    opacity: 0.85,
    fontFamily: 'Roboto_400Regular',
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
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    ...TextStyles.body,
    fontSize: 15,
    color: '#64748b',
  },
  linkBold: {
    color: Colors.primary,
    fontWeight: '700',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  hint: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
