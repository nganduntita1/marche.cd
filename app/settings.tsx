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
  Eye,
  EyeOff,
  Star,
  Share2,
  FileText,
  X,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
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
      const savedDarkMode = await AsyncStorage.getItem('dark_mode');
      
      if (savedLanguage) setLanguage(savedLanguage as 'fr' | 'en');
      if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: 'fr' | 'en') => {
    try {
      await AsyncStorage.setItem('app_language', newLanguage);
      setLanguage(newLanguage);
      setShowLanguageModal(false);
      Alert.alert('Succès', 'Langue mise à jour. Redémarrez l\'app pour voir les changements.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de changer la langue');
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('dark_mode', value.toString());
      setDarkMode(value);
      Alert.alert('Info', 'Le mode sombre sera disponible dans une prochaine mise à jour');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de changer le mode');
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Alert.alert('Succès', 'Mot de passe mis à jour avec succès');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de changer le mot de passe');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Se déconnecter',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
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
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Info', 'Contactez le support pour supprimer votre compte.');
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
    Alert.alert('Merci!', 'Nous apprécions votre soutien. Notez-nous sur l\'App Store ou Google Play.');
  };

  const handleShareApp = () => {
    Alert.alert('Partager', 'Partagez Marché.cd avec vos amis!');
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
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          <SettingSection title="Compte">
            <SettingItem
              icon={User}
              title="Modifier le profil"
              subtitle="Nom, photo, téléphone, ville"
              onPress={() => router.push('/edit-profile')}
            />
            <SettingItem
              icon={Mail}
              title="Email"
              subtitle={user?.email || 'Non défini'}
              onPress={() => Alert.alert('Info', 'Contactez le support pour changer votre email')}
            />
            <SettingItem
              icon={Lock}
              title="Changer le mot de passe"
              subtitle="Sécurisez votre compte"
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
          <SettingSection title="Notifications">
            <ToggleItem
              icon={Bell}
              title="Notifications push"
              subtitle="Recevoir des notifications sur votre appareil"
              value={pushNotifications}
              onValueChange={setPushNotifications}
            />
            <ToggleItem
              icon={Mail}
              title="Notifications email"
              subtitle="Recevoir des emails pour les mises à jour"
              value={emailNotifications}
              onValueChange={setEmailNotifications}
            />
            <ToggleItem
              icon={Bell}
              title="Alertes de messages"
              subtitle="Notifications pour les nouveaux messages"
              value={messageAlerts}
              onValueChange={setMessageAlerts}
            />
          </SettingSection>

          {/* Preferences Section */}
          <SettingSection title="Préférences">
            <SettingItem
              icon={Globe}
              title="Langue"
              subtitle={language === 'fr' ? 'Français' : 'English'}
              onPress={() => setShowLanguageModal(true)}
            />
            <ToggleItem
              icon={Moon}
              title="Mode sombre"
              subtitle="Bientôt disponible"
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
          <SettingSection title="Support & Aide">
            <SettingItem
              icon={HelpCircle}
              title="Centre d'aide"
              subtitle="FAQ et guides"
              onPress={() => router.push('/help-center')}
            />
            <SettingItem
              icon={Mail}
              title="Contacter le support"
              subtitle="Besoin d'aide ? Contactez-nous"
              onPress={handleContactSupport}
            />
            <SettingItem
              icon={FileText}
              title="Conditions d'utilisation"
              onPress={() => router.push('/terms')}
            />
            <SettingItem
              icon={Shield}
              title="Politique de confidentialité"
              onPress={() => router.push('/privacy')}
            />
          </SettingSection>

          {/* App Info Section */}
          <SettingSection title="À propos">
            <SettingItem
              icon={Info}
              title="Version de l'application"
              subtitle={`v${appVersion}`}
              showArrow={false}
            />
            <SettingItem
              icon={Star}
              title="Noter l'application"
              subtitle="Aidez-nous à nous améliorer"
              onPress={handleRateApp}
            />
            <SettingItem
              icon={Share2}
              title="Partager l'application"
              subtitle="Invitez vos amis"
              onPress={handleShareApp}
            />
          </SettingSection>

          {/* Danger Zone */}
          <SettingSection title="Zone de danger">
            <SettingItem
              icon={LogOut}
              title="Se déconnecter"
              onPress={handleSignOut}
            />
            <SettingItem
              icon={Trash2}
              title="Supprimer le compte"
              subtitle="Action irréversible"
              onPress={handleDeleteAccount}
            />
          </SettingSection>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Marché.cd</Text>
            <Text style={styles.footerSubtext}>
              Votre marketplace de confiance en RDC 🇨🇩
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
                <Text style={styles.modalTitle}>Choisir la langue</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.languageOption, language === 'fr' && styles.languageOptionSelected]}
                onPress={() => handleLanguageChange('fr')}
              >
                <Text style={[styles.languageText, language === 'fr' && styles.languageTextSelected]}>
                  🇫🇷 Français
                </Text>
                {language === 'fr' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.languageOption, language === 'en' && styles.languageOptionSelected]}
                onPress={() => handleLanguageChange('en')}
              >
                <Text style={[styles.languageText, language === 'en' && styles.languageTextSelected]}>
                  🇬🇧 English Coming soon!
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
                <Text style={styles.modalTitle}>Changer le mot de passe</Text>
                <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordForm}>
                <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Minimum 6 caractères"
                  placeholderTextColor="#94a3b8"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Retapez le mot de passe"
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
                  <Text style={styles.changePasswordButtonText}>Changer le mot de passe</Text>
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
