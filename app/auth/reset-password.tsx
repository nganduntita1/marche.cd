import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';
import { useTranslation } from 'react-i18next';

type ResetMethod = 'email' | 'phone';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ identifier?: string; method?: string }>();
  const initialMethod: ResetMethod = params.method === 'phone' ? 'phone' : 'email';

  const [method, setMethod] = useState<ResetMethod>(initialMethod);
  const [identifier, setIdentifier] = useState((params.identifier || '').toString());
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoverySessionReady, setRecoverySessionReady] = useState(false);

  const { verifyResetOtpAndUpdatePassword } = useAuth();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isFrench = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().startsWith('fr');
  const txt = (fr: string, en: string) => (isFrench ? fr : en);

  const normalizedIdentifier = useMemo(() => identifier.trim(), [identifier]);

  useEffect(() => {
    let isMounted = true;

    const checkRecoverySession = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted && !!data.session) {
        setRecoverySessionReady(true);
      }
    };

    void checkRecoverySession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setRecoverySessionReady(!!session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async () => {
    const needsOtp = method === 'phone' || !recoverySessionReady;

    if ((needsOtp && (!normalizedIdentifier || !otp)) || !newPassword || !confirmPassword) {
      setError(txt('Veuillez remplir tous les champs', 'Please fill in all fields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(txt('Les mots de passe ne correspondent pas', 'Passwords do not match'));
      return;
    }

    if (newPassword.length < 6) {
      setError(txt('Le mot de passe doit contenir au moins 6 caracteres', 'Password must be at least 6 characters'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyResetOtpAndUpdatePassword(
        normalizedIdentifier,
        needsOtp ? otp : undefined,
        newPassword,
        method
      );
      Alert.alert(
        txt('Mot de passe mis a jour', 'Password updated'),
        txt('Connectez-vous avec votre nouveau mot de passe.', 'Sign in with your new password.'),
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
    } catch (err: any) {
      setError(err.message || txt('Echec de la reinitialisation', 'Reset failed'));
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
              <Text style={styles.welcomeText}>{txt('Code de verification', 'Verification code')}</Text>
              <Text style={styles.subtitle}>
                {txt(
                  'Entrez le code recu puis choisissez votre nouveau mot de passe.',
                  'Enter your received code, then choose a new password.'
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

            {(method === 'phone' || !recoverySessionReady) ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {method === 'email' ? txt('Adresse Email', 'Email Address') : txt('Numero de telephone', 'Phone number')}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={
                      method === 'email' ? 'votre@email.com' : txt('+243 ou 0...', '+243 or 0...')
                    }
                    placeholderTextColor="#94a3b8"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{txt('Code OTP', 'OTP code')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={txt('Entrez le code recu', 'Enter received code')}
                    placeholderTextColor="#94a3b8"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                  />
                </View>
              </>
            ) : (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  {txt(
                    'Lien de reinitialisation detecte. Vous pouvez definir un nouveau mot de passe directement.',
                    'Reset link detected. You can set your new password directly.'
                  )}
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{txt('Nouveau mot de passe', 'New password')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.inputIcon} onPress={() => setShowPassword((prev) => !prev)}>
                  {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
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
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
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
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? txt('Mise a jour...', 'Updating...') : txt('Mettre a jour', 'Update password')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/auth/login')}>
              <Text style={styles.linkText}>{txt('Retour a la connexion', 'Back to sign in')}</Text>
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
  inputGroup: {
    marginBottom: 20,
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
  infoContainer: {
    backgroundColor: '#ecfeff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#0891b2',
  },
  infoText: {
    color: '#0e7490',
    fontSize: 13,
    fontWeight: '500',
  },
});