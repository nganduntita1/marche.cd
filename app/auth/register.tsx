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
import { Phone, Eye, EyeOff, User, CheckSquare, Square, Mail, MapPin } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const generateEmail = async (firstName: string, lastName: string): Promise<string> => {
    // Clean and normalize names
    const cleanFirst = firstName.trim().toLowerCase().replace(/\s+/g, '');
    const cleanLast = lastName.trim().toLowerCase().replace(/\s+/g, '');
    const baseEmail = `${cleanFirst}.${cleanLast}@marchecd.com`;

    // Check if email exists
    const { data: existingUsers } = await supabase
      .from('users')
      .select('email')
      .like('email', `${cleanFirst}.${cleanLast}%@marchecd.com`);

    if (!existingUsers || existingUsers.length === 0) {
      return baseEmail;
    }

    // Find the next available number
    let counter = 1;
    let emailExists = true;
    let newEmail = baseEmail;

    while (emailExists) {
      newEmail = `${cleanFirst}.${cleanLast}${counter}@marchecd.com`;
      const exists = existingUsers.some(u => u.email === newEmail);
      if (!exists) {
        emailExists = false;
      } else {
        counter++;
      }
    }

    return newEmail;
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !phone || !location || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!agreedToTerms) {
      setError('Veuillez accepter les Conditions d\'utilisation et la Politique de confidentialité');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validate phone number format
    if (!phone.startsWith('+243') && !phone.startsWith('0')) {
      setError('Le numéro de téléphone doit commencer par +243 ou 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use provided email or generate one
      const finalEmail = email.trim() || await generateEmail(firstName, lastName);
      const fullName = `${firstName} ${lastName}`;

      await signUp(finalEmail, password, fullName, phone, location);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte');
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
                <Text style={styles.welcomeText}>Rejoignez</Text>
              </View>
              <Text style={styles.subtitle}>
                Créez votre compte et commencez à acheter et vendre au Congo
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
              <Text style={styles.label}>Prénom</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Votre prénom"
                  placeholderTextColor="#94a3b8"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <View style={styles.inputIcon}>
                  <User size={20} color="#64748b" />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom de famille</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Votre nom de famille"
                  placeholderTextColor="#94a3b8"
                  value={lastName}
                  onChangeText={setLastName}
                />
                <View style={styles.inputIcon}>
                  <User size={20} color="#64748b" />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (optionnel)</Text>
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
              <Text style={styles.hint}>
                Si vide, nous créerons un email automatiquement
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de téléphone *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="+243 ou 0..."
                  placeholderTextColor="#94a3b8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <View style={styles.inputIcon}>
                  <Phone size={20} color="#64748b" />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ville *</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.inputIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#64748b" />
                  ) : (
                    <Eye size={20} color="#64748b" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                {agreedToTerms ? (
                  <CheckSquare size={24} color={Colors.primary} fill={Colors.primary} />
                ) : (
                  <Square size={24} color="#94a3b8" />
                )}
              </View>
              <Text style={styles.checkboxText}>
                J'accepte les{' '}
                <Text style={styles.checkboxLink}>Conditions d'utilisation</Text> et la{' '}
                <Text style={styles.checkboxLink}>Politique de confidentialité</Text> de Marche CD.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.linkText}>
                Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text>
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
    marginBottom: 20,
  },
  label: {
    ...TextStyles.label,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  checkboxLink: {
    fontWeight: '700',
    color: Colors.primary,
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
    ...TextStyles.button,
    fontSize: 17,
    color: '#fff',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
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
