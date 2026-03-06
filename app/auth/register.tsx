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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Phone, Eye, EyeOff, User, CheckSquare, Square, Mail, MapPin } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useGuidance } from '@/contexts/GuidanceContext';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';
import { GuidedTour } from '@/components/guidance/GuidedTour';
import { Tooltip } from '@/components/guidance/Tooltip';
import { useTranslation } from 'react-i18next';

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
  const { i18n } = useTranslation();
  const isFrench = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().startsWith('fr');
  const txt = (fr: string, en: string) => (isFrench ? fr : en);
  
  // Guidance state
  const guidance = useGuidance();
  const [showTour, setShowTour] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  // Initialize guidance on mount
  useEffect(() => {
    guidance.incrementScreenView('register');
    
    // Show tour if first visit
    if (guidance.shouldShowTour('auth_registration_tour')) {
      setShowTour(true);
    }
  }, []);

  // Handle tour completion
  const handleTourComplete = () => {
    setShowTour(false);
    guidance.markTourCompleted('auth_registration_tour');
  };

  const handleTourSkip = () => {
    setShowTour(false);
    guidance.markTourCompleted('auth_registration_tour');
  };

  // Show tooltips on field focus
  const handlePhoneFocus = () => {
    setPhoneFocused(true);
    if (guidance.shouldShowTooltip('auth_phone_number')) {
      setActiveTooltip('auth_phone_number');
    }
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
    if (guidance.shouldShowTooltip('auth_password')) {
      setActiveTooltip('auth_password');
    }
  };

  const handleLocationFocus = () => {
    setLocationFocused(true);
    if (guidance.shouldShowTooltip('auth_location')) {
      setActiveTooltip('auth_location');
    }
  };

  const handleEmailFocus = () => {
    setEmailFocused(true);
    if (guidance.shouldShowTooltip('auth_email_optional')) {
      setActiveTooltip('auth_email_optional');
    }
  };

  const handleTooltipDismiss = (tooltipId: string) => {
    setActiveTooltip(null);
    guidance.markTooltipDismissed(tooltipId);
  };

  // Get tour and tooltip content
  const tour = guidance.state.settings.language === 'fr' 
    ? guidance.getTooltipContent('auth_registration_tour') 
    : guidance.getTooltipContent('auth_registration_tour');
  
  const tourContent = showTour ? (() => {
    const lang = guidance.state.settings.language;
    const service = require('@/services/guidanceContent').GuidanceContentService;
    return service.getTour('auth_registration_tour', lang);
  })() : null;

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
      setError(txt('Veuillez remplir tous les champs obligatoires', 'Please fill in all required fields'));
      return;
    }

    if (!agreedToTerms) {
      setError(txt('Veuillez accepter les Conditions d\'utilisation et la Politique de confidentialité', 'Please accept the Terms of Use and Privacy Policy'));
      return;
    }

    if (password !== confirmPassword) {
      setError(txt('Les mots de passe ne correspondent pas', 'Passwords do not match'));
      return;
    }

    if (password.length < 6) {
      setError(txt('Le mot de passe doit contenir au moins 6 caractères', 'Password must be at least 6 characters'));
      return;
    }

    // Validate phone number format
    if (!phone.startsWith('+243') && !phone.startsWith('0')) {
      setError(txt('Le numéro de téléphone doit commencer par +243 ou 0', 'Phone number must start with +243 or 0'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use provided email or generate one
      const finalEmail = email.trim() || await generateEmail(firstName, lastName);
      const fullName = `${firstName} ${lastName}`;

      await signUp(finalEmail, password, fullName, phone, location);
      
      // Mark registration completed
      guidance.markActionCompleted('registration_completed');
      
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || txt('Erreur lors de la création du compte', 'Error creating account'));
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
                <Text style={styles.welcomeText}>{txt('Rejoignez', 'Join')}</Text>
              </View>
              <Text style={styles.subtitle}>
                {txt('Créez votre compte et commencez à acheter et vendre au Congo', 'Create your account and start buying and selling in the Congo')}
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
              <Text style={styles.label}>{txt('Prénom', 'First name')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={txt('Votre prénom', 'Your first name')}
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
              <Text style={styles.label}>{txt('Nom de famille', 'Last name')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={txt('Votre nom de famille', 'Your last name')}
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
              <Text style={styles.label}>{txt('Email (optionnel)', 'Email (optional)')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={handleEmailFocus}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.inputIcon}>
                  <Mail size={20} color="#64748b" />
                </View>
              </View>
              <Text style={styles.hint}>
                {txt('Si vide, nous créerons un email automatiquement', 'If empty, we will create an email automatically')}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{txt('Numéro de téléphone *', 'Phone number *')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={txt('+243 ou 0...', '+243 or 0...')}
                  placeholderTextColor="#94a3b8"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={handlePhoneFocus}
                  onBlur={() => setPhoneFocused(false)}
                  keyboardType="phone-pad"
                />
                <View style={styles.inputIcon}>
                  <Phone size={20} color="#64748b" />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{txt('Ville *', 'City *')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Kinshasa, Lubumbashi, etc."
                  placeholderTextColor="#94a3b8"
                  value={location}
                  onChangeText={setLocation}
                  onFocus={handleLocationFocus}
                  onBlur={() => setLocationFocused(false)}
                />
                <View style={styles.inputIcon}>
                  <MapPin size={20} color="#64748b" />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{txt('Mot de passe', 'Password')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={handlePasswordFocus}
                  onBlur={() => setPasswordFocused(false)}
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
              <Text style={styles.label}>{txt('Confirmer le mot de passe', 'Confirm password')}</Text>
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
                {txt("J'accepte les ", 'I accept the ')}
                <Text style={styles.checkboxLink}>{txt("Conditions d'utilisation", 'Terms of Use')}</Text>
                {txt(' et la ', ' and the ')}
                <Text style={styles.checkboxLink}>{txt('Politique de confidentialité', 'Privacy Policy')}</Text>
                {txt(' de Marche CD.', ' of Marché.cd.')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? txt('Création...', 'Creating...') : txt('Créer mon compte', 'Create my account')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.linkText}>
                {txt('Déjà un compte ? ', 'Already have an account? ')}
                <Text style={styles.linkBold}>{txt('Se connecter', 'Sign in')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Guided Tour */}
      {tourContent && (
        <GuidedTour
          tour={tourContent}
          visible={showTour}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}

      {/* Tooltips */}
      {activeTooltip === 'auth_phone_number' && (
        <Tooltip
          content={guidance.getTooltipContent('auth_phone_number')!}
          visible={true}
          onDismiss={() => handleTooltipDismiss('auth_phone_number')}
        />
      )}

      {activeTooltip === 'auth_password' && (
        <Tooltip
          content={guidance.getTooltipContent('auth_password')!}
          visible={true}
          onDismiss={() => handleTooltipDismiss('auth_password')}
        />
      )}

      {activeTooltip === 'auth_location' && (
        <Tooltip
          content={guidance.getTooltipContent('auth_location')!}
          visible={true}
          onDismiss={() => handleTooltipDismiss('auth_location')}
        />
      )}

      {activeTooltip === 'auth_email_optional' && (
        <Tooltip
          content={guidance.getTooltipContent('auth_email_optional')!}
          visible={true}
          onDismiss={() => handleTooltipDismiss('auth_email_optional')}
        />
      )}
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
