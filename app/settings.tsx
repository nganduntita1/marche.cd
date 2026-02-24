import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Globe, 
  Shield, 
  HelpCircle, 
  Info,
  ChevronRight,
  Moon,
  Trash2,
  LogOut,
  Mail,
  Lock,
  Star,
  Share2,
  FileText,
  X,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import i18n from '../lib/i18n';

const LANGUAGE_MODE_STORAGE_KEY = 'app_language_mode';
const LANGUAGE_MODE_MANUAL = 'manual';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      const languageMode = await AsyncStorage.getItem(LANGUAGE_MODE_STORAGE_KEY);
      const savedDarkMode = await AsyncStorage.getItem('dark_mode');
      
      if (savedLanguage && languageMode === LANGUAGE_MODE_MANUAL) {
        setLanguage(savedLanguage as 'fr' | 'en');
      } else {
        const detected = (i18n.language || 'fr').split('-')[0];
        if (detected === 'en' || detected === 'fr') {
          setLanguage(detected);
        }
      }
      if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: 'fr' | 'en') => {
    try {
      await AsyncStorage.setItem('app_language', newLanguage);
      await AsyncStorage.setItem(LANGUAGE_MODE_STORAGE_KEY, LANGUAGE_MODE_MANUAL);
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
      setShowLanguageModal(false);
      Alert.alert(t('success'), t('language_updated'));
    } catch (error) {
      Alert.alert(t('error'), t('language_change_failed'));
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('dark_mode', value.toString());
      setDarkMode(value);
      Alert.alert(t('info'), t('settings_dark_mode_coming_soon'));
    } catch (error) {
      Alert.alert(t('error'), t('settings_change_mode_failed'));
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('error'), t('settings_fill_all_fields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('settings_passwords_not_match'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('error'), t('settings_password_min_length'));
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Alert.alert(t('success'), t('settings_password_updated_success'));
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('settings_change_password_failed'));
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('settings_sign_out_title'),
      t('settings_sign_out_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('sign_out'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('delete_account'),
      t('settings_delete_account_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete_account'),
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert(t('info'), t('settings_contact_support_delete'));
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    const whatsappUrl = 'https://wa.me/27672727343?text=Bonjour, j\'ai besoin d\'aide avec Marché.cd';
    Linking.openURL(whatsappUrl);
  };

  const handleRateApp = () => {
    // TODO: Add actual app store links
    Alert.alert(t('settings_thanks_title'), t('settings_rate_app_message'));
  };

  const handleShareApp = () => {
    Alert.alert(t('share_app'), t('settings_share_message'));
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightElement,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="#9bbd1f" strokeWidth={2} />
        </View>
        <View style={styles.settingItemText}>
          <Text style={styles.settingItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (showArrow && <ChevronRight size={20} color="#94a3b8" />)}
    </TouchableOpacity>
  );

  const ToggleItem = ({
    icon: Icon,
    title,
    subtitle,
    value,
    onValueChange,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <SettingItem
      icon={Icon}
      title={title}
      subtitle={subtitle}
      showArrow={false}
      rightElement={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#e2e8f0', true: '#9bbd1f' }}
          thumbColor="#fff"
        />
      }
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings')}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          <SettingSection title={t('account')}>
            <SettingItem
              icon={User}
              title={t('edit_profile')}
              subtitle={t('edit_profile_subtitle')}
              onPress={() => router.push('/edit-profile')}
            />
            <SettingItem
              icon={Mail}
              title={t('email')}
              subtitle={user?.email || t('not_defined')}
              onPress={() => Alert.alert(t('info'), t('contact_support_change_email'))}
            />
            <SettingItem
              icon={Lock}
              title={t('change_password')}
              subtitle={t('secure_account')}
              onPress={() => setShowPasswordModal(true)}
            />
            {/* TODO: Implement 2FA
            <SettingItem
              icon={Shield}
              title="Authentification à deux facteurs"
              subtitle="Sécurité renforcée"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
            */}
          </SettingSection>

          {/* Notifications Section */}
          <SettingSection title={t('notifications')}>
            <ToggleItem
              icon={Bell}
              title={t('push_notifications')}
              subtitle={t('push_notifications_subtitle')}
              value={pushNotifications}
              onValueChange={setPushNotifications}
            />
            <ToggleItem
              icon={Mail}
              title={t('email_notifications')}
              subtitle={t('email_notifications_subtitle')}
              value={emailNotifications}
              onValueChange={setEmailNotifications}
            />
            <ToggleItem
              icon={Bell}
              title={t('message_alerts')}
              subtitle={t('message_alerts_subtitle')}
              value={messageAlerts}
              onValueChange={setMessageAlerts}
            />
          </SettingSection>

          {/* Preferences Section */}
          <SettingSection title={t('preferences')}>
            <SettingItem
              icon={Globe}
              title={t('language')}
              subtitle={language === 'fr' ? t('language_french') : t('language_english')}
              onPress={() => setShowLanguageModal(true)}
            />
            <ToggleItem
              icon={Moon}
              title={t('dark_mode')}
              subtitle={t('dark_mode_soon')}
              value={darkMode}
              onValueChange={handleDarkModeToggle}
            />
            {/* TODO: Implement privacy settings
            <SettingItem
              icon={Eye}
              title="Confidentialité"
              subtitle="Qui peut voir votre profil"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
            */}
          </SettingSection>

          {/* Support Section */}
          <SettingSection title={t('support_help')}>
            <SettingItem
              icon={HelpCircle}
              title={t('help_center')}
              subtitle={t('faq_guides')}
              onPress={() => router.push('/help-center')}
            />
            <SettingItem
              icon={Mail}
              title={t('contact_support')}
              subtitle={t('need_help_contact')}
              onPress={handleContactSupport}
            />
            <SettingItem
              icon={FileText}
              title={t('terms_of_use')}
              onPress={() => router.push('/terms')}
            />
            <SettingItem
              icon={Shield}
              title={t('privacy_policy')}
              onPress={() => router.push('/privacy')}
            />
          </SettingSection>

          {/* App Info Section */}
          <SettingSection title={t('about')}>
            <SettingItem
              icon={Info}
              title={t('app_version')}
              subtitle={`v${appVersion}`}
              showArrow={false}
            />
            <SettingItem
              icon={Star}
              title={t('rate_app')}
              subtitle={t('help_us_improve')}
              onPress={handleRateApp}
            />
            <SettingItem
              icon={Share2}
              title={t('share_app')}
              subtitle={t('invite_friends')}
              onPress={handleShareApp}
            />
          </SettingSection>

          {/* Danger Zone */}
          <SettingSection title={t('danger_zone')}>
            <SettingItem
              icon={LogOut}
              title={t('sign_out')}
              onPress={handleSignOut}
            />
            <SettingItem
              icon={Trash2}
              title={t('delete_account')}
              subtitle={t('irreversible_action')}
              onPress={handleDeleteAccount}
            />
          </SettingSection>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('app_name')}</Text>
            <Text style={styles.footerSubtext}>
              {t('app_tagline')}
            </Text>
          </View>
        </ScrollView>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowLanguageModal(false)}
          >
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('choose_language')}</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.languageOption, language === 'fr' && styles.languageOptionSelected]}
                onPress={() => handleLanguageChange('fr')}
              >
                <Text style={[styles.languageText, language === 'fr' && styles.languageTextSelected]}>
                  🇫🇷 {t('language_french')}
                </Text>
                {language === 'fr' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.languageOption, language === 'en' && styles.languageOptionSelected]}
                onPress={() => handleLanguageChange('en')}
              >
                <Text style={[styles.languageText, language === 'en' && styles.languageTextSelected]}>
                  🇬🇧 {t('language_english')}
                </Text>
                {language === 'en' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Password Change Modal */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPasswordModal(false)}
          >
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('change_password')}</Text>
                <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordForm}>
                <Text style={styles.inputLabel}>{t('new_password')}</Text>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t('minimum_6_characters')}
                  placeholderTextColor="#94a3b8"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>{t('confirm_password')}</Text>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t('retype_password')}
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  style={styles.changePasswordButton}
                  onPress={handlePasswordChange}
                >
                  <Text style={styles.changePasswordButtonText}>{t('change_password')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  languageOptionSelected: {
    backgroundColor: '#f0fdf4',
  },
  languageText: {
    fontSize: 16,
    color: '#1e293b',
  },
  languageTextSelected: {
    fontWeight: '600',
    color: '#9bbd1f',
  },
  checkmark: {
    fontSize: 20,
    color: '#9bbd1f',
    fontWeight: '700',
  },
  passwordForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 12,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  changePasswordButton: {
    backgroundColor: '#9bbd1f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
