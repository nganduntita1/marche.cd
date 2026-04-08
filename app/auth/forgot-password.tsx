import React, { useMemo, useState } from 'react';
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, Phone } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';
import { useTranslation } from 'react-i18next';

type ResetMethod = 'email' | 'phone';

export default function ForgotPasswordScreen() {
  const [method, setMethod] = useState<ResetMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestPasswordResetOtp } = useAuth();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isFrench = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().startsWith('fr');
  const txt = (fr: string, en: string) => (isFrench ? fr : en);

  const identifier = useMemo(
    () => (method === 'email' ? email.trim() : phone.trim()),
    [email, method, phone]
  );

  const handleSendCode = async () => {
    if (!identifier) {
      setError(
        method === 'email'
          ? txt('Veuillez entrer votre email', 'Please enter your email')
          : txt('Veuillez entrer votre numéro', 'Please enter your phone number')
      );
      return;
    }

    if (method === 'phone' && !identifier.startsWith('+243') && !identifier.startsWith('0')) {
      setError(
        txt(
          'Le numéro doit commencer par +243 ou 0',
          'Phone number must start with +243 or 0'
        )
      );
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await requestPasswordResetOtp(identifier, method);
      setSuccess(
        method === 'email'
          ? txt(
              'Lien de reinitialisation envoye par email. Ouvrez ce lien pour continuer.',
              'Reset link sent by email. Open that link to continue.'
            )
          : txt('Code envoyé par SMS. Vérifiez vos messages.', 'Code sent by SMS. Check your messages.')
      );
    } catch (err: any) {
      setError(err.message || txt('Impossible d\'envoyer le code', 'Unable to send reset code'));
    } finally {
      setLoading(false);
    }
  };

  const goToReset = () => {
    router.push(
      `/auth/reset-password?method=${method}&identifier=${encodeURIComponent(identifier)}` as any
    );
  };

  const contactSupport = async () => {
    const message = txt(
      'Bonjour, je n\'arrive pas a reinitialiser mon mot de passe sur Marche.cd. Pouvez-vous m\'aider ?',
      'Hello, I cannot reset my Marché.cd password. Can you help me?'
    );
    const whatsappUrl = `https://wa.me/27672727343?text=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
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
              <Text style={styles.welcomeText}>{txt('Mot de passe oublie ?', 'Forgot password?')}</Text>
              <Text style={styles.subtitle}>
                {txt(
                  'Choisissez email ou numero pour recevoir un code de reinitialisation.',
                  'Choose email or phone to receive a reset code.'
                )}
              </Text>
            </LinearGradient>
          </LinearGradient>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <View style={styles.switchRow}>
              <TouchableOpacity
                style={[styles.switchButton, method === 'email' && styles.switchButtonActive]}
                onPress={() => setMethod('email')}
              >
                <Text
                  style={[styles.switchButtonText, method === 'email' && styles.switchButtonTextActive]}
                >
                  {txt('Email', 'Email')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.switchButton, method === 'phone' && styles.switchButtonActive]}
                onPress={() => setMethod('phone')}
              >
                <Text
                  style={[styles.switchButtonText, method === 'phone' && styles.switchButtonTextActive]}
                >
                  {txt('Numero', 'Phone')}
                </Text>
              </TouchableOpacity>
            </View>

            {method === 'email' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{txt('Adresse Email', 'Email Address')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="votre@email.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <View style={styles.inputIcon}>
                    <Mail size={20} color="#64748b" />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{txt('Numero de telephone', 'Phone number')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={txt('+243 ou 0...', '+243 or 0...')}
                    placeholderTextColor="#94a3b8"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                  />
                  <View style={styles.inputIcon}>
                    <Phone size={20} color="#64748b" />
                  </View>
                </View>
                <Text style={styles.hint}>
                  {txt(
                    'Le reset par numero depend de la configuration SMS de Supabase.',
                    'Phone reset depends on Supabase SMS provider configuration.'
                  )}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? txt('Envoi...', 'Sending...') : txt('Envoyer le code', 'Send code')}
              </Text>
            </TouchableOpacity>

            {success && method === 'phone' ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={goToReset}>
                <Text style={styles.secondaryButtonText}>
                  {txt('J\'ai recu un code', 'I received a code')}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.supportButton} onPress={contactSupport}>
              <Text style={styles.supportText}>
                {txt(
                  'Je n\'ai ni email actif ni SMS. Contacter le support',
                  'I have no active email or SMS. Contact support'
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/auth/login')}>
              <Text style={styles.linkText}>
                {txt('Retour a la connexion', 'Back to sign in')}
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
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 32,
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
  switchRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  switchButton: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchButtonActive: {
    backgroundColor: '#ffffff',
  },
  switchButtonText: {
    ...TextStyles.body,
    color: '#64748b',
    fontWeight: '600',
  },
  switchButtonTextActive: {
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
    color: '#fff',
    ...TextStyles.button,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  supportButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  supportText: {
    ...TextStyles.body,
    fontSize: 14,
    color: '#0f766e',
    textAlign: 'center',
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
  successContainer: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  successText: {
    color: '#047857',
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