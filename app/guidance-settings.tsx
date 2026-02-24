import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Modal,
  AccessibilityInfo,
} from 'react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  HelpCircle,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Info,
  CheckCircle,
  Circle,
  ChevronRight,
  Sparkles,
  BookOpen,
  Zap,
  X,
} from 'lucide-react-native';
import { useGuidance } from '@/contexts/GuidanceContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_OPT_IN_KEY = '@marche_cd:guidance_analytics_opt_in';

export default function GuidanceSettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { state, setGuidanceLevel, setShowAnimations, resetGuidance } = useGuidance();
  
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showTourListModal, setShowTourListModal] = useState(false);

  useEffect(() => {
    loadAnalyticsPreference();
    checkScreenReader();
  }, []);

  const loadAnalyticsPreference = async () => {
    try {
      const value = await AsyncStorage.getItem(ANALYTICS_OPT_IN_KEY);
      setAnalyticsOptIn(value === 'true');
    } catch (error) {
      console.error('Error loading analytics preference:', error);
    }
  };

  const checkScreenReader = async () => {
    try {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setScreenReaderEnabled(enabled);
    } catch (error) {
      console.error('Error checking screen reader:', error);
    }
  };

  const handleAnalyticsToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(ANALYTICS_OPT_IN_KEY, value.toString());
      setAnalyticsOptIn(value);
      
      if (value) {
        Alert.alert(
          t('guidance.analytics_enabled_title'),
          t('guidance.analytics_enabled_message')
        );
      }
    } catch (error) {
      Alert.alert(t('error'), t('guidance.analytics_toggle_failed'));
    }
  };

  const handleGuidanceLevelChange = async (level: 'full' | 'minimal' | 'off') => {
    try {
      await setGuidanceLevel(level);
      setShowLevelModal(false);
      
      let message = '';
      switch (level) {
        case 'full':
          message = t('guidance.level_full_message');
          break;
        case 'minimal':
          message = t('guidance.level_minimal_message');
          break;
        case 'off':
          message = t('guidance.level_off_message');
          break;
      }
      
      Alert.alert(t('success'), message);
    } catch (error) {
      Alert.alert(t('error'), t('guidance.level_change_failed'));
    }
  };

  const handleResetAllGuidance = () => {
    Alert.alert(
      t('guidance.reset_all_title'),
      t('guidance.reset_all_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('guidance.reset'),
          style: 'destructive',
          onPress: async () => {
            try {
              await resetGuidance();
              setShowResetModal(false);
              Alert.alert(t('success'), t('guidance.reset_success'));
            } catch (error) {
              Alert.alert(t('error'), t('guidance.reset_failed'));
            }
          },
        },
      ]
    );
  };

  const handleResetSpecificTour = async (tourId: string, tourName: string) => {
    Alert.alert(
      t('guidance.reset_tour_title'),
      t('guidance.reset_tour_message', { tourName }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('guidance.reset'),
          style: 'destructive',
          onPress: async () => {
            try {
              await resetGuidance(tourId);
              setShowTourListModal(false);
              Alert.alert(t('success'), t('guidance.tour_reset_success', { tourName }));
            } catch (error) {
              Alert.alert(t('error'), t('guidance.tour_reset_failed'));
            }
          },
        },
      ]
    );
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'full':
        return Sparkles;
      case 'minimal':
        return Zap;
      case 'off':
        return EyeOff;
      default:
        return HelpCircle;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'full':
        return Colors.primary;
      case 'minimal':
        return '#f59e0b';
      case 'off':
        return '#64748b';
      default:
        return Colors.primary;
    }
  };

  const availableTours = [
    { id: 'landing_tour', name: t('guidance.tour_landing') },
    { id: 'auth_tour', name: t('guidance.tour_auth') },
    { id: 'home_tour', name: t('guidance.tour_home') },
    { id: 'listing_detail_tour', name: t('guidance.tour_listing') },
    { id: 'messaging_tour', name: t('guidance.tour_messaging') },
    { id: 'posting_tour', name: t('guidance.tour_posting') },
    { id: 'profile_tour', name: t('guidance.tour_profile') },
    { id: 'search_tour', name: t('guidance.tour_search') },
    { id: 'seller_dashboard_tour', name: t('guidance.tour_seller') },
  ];

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
    iconColor,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
    iconColor?: string;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessible={true}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      accessibilityRole="button"
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, iconColor && { backgroundColor: `${iconColor}15` }]}>
          <Icon size={20} color={iconColor || Colors.primary} strokeWidth={2} />
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
    iconColor,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    iconColor?: string;
  }) => (
    <SettingItem
      icon={Icon}
      title={title}
      subtitle={subtitle}
      showArrow={false}
      iconColor={iconColor}
      rightElement={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#e2e8f0', true: Colors.primary }}
          thumbColor="#fff"
          accessible={true}
          accessibilityLabel={title}
          accessibilityRole="switch"
          accessibilityState={{ checked: value }}
        />
      }
    />
  );

  const currentLevel = state?.settings.guidanceLevel || 'full';
  const LevelIcon = getLevelIcon(currentLevel);
  const levelColor = getLevelColor(currentLevel);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            accessible={true}
            accessibilityLabel={t('back')}
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('guidance.settings_title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Current Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIcon, { backgroundColor: `${levelColor}15` }]}>
                <LevelIcon size={24} color={levelColor} strokeWidth={2} />
              </View>
              <View style={styles.statusText}>
                <Text style={styles.statusTitle}>{t('guidance.current_level')}</Text>
                <Text style={[styles.statusLevel, { color: levelColor }]}>
                  {t(`guidance.level_${currentLevel}`)}
                </Text>
              </View>
            </View>
            <Text style={styles.statusDescription}>
              {t(`guidance.level_${currentLevel}_description`)}
            </Text>
          </View>

          {/* Guidance Level */}
          <SettingSection title={t('guidance.guidance_level')}>
            <SettingItem
              icon={getLevelIcon(currentLevel)}
              title={t('guidance.change_level')}
              subtitle={t(`guidance.level_${currentLevel}`)}
              onPress={() => setShowLevelModal(true)}
              iconColor={levelColor}
            />
          </SettingSection>

          {/* Tutorial Management */}
          <SettingSection title={t('guidance.tutorial_management')}>
            <SettingItem
              icon={BookOpen}
              title={t('guidance.replay_tutorials')}
              subtitle={t('guidance.replay_tutorials_subtitle')}
              onPress={() => setShowTourListModal(true)}
            />
            <SettingItem
              icon={RotateCcw}
              title={t('guidance.reset_all')}
              subtitle={t('guidance.reset_all_subtitle')}
              onPress={() => setShowResetModal(true)}
              iconColor="#ef4444"
            />
          </SettingSection>

          {/* Accessibility */}
          <SettingSection title={t('guidance.accessibility')}>
            <SettingItem
              icon={screenReaderEnabled ? Volume2 : VolumeX}
              title={t('guidance.screen_reader')}
              subtitle={
                screenReaderEnabled
                  ? t('guidance.screen_reader_enabled')
                  : t('guidance.screen_reader_disabled')
              }
              showArrow={false}
              iconColor={screenReaderEnabled ? Colors.primary : '#64748b'}
            />
            <ToggleItem
              icon={Sparkles}
              title={t('guidance.show_animations')}
              subtitle={t('guidance.show_animations_subtitle')}
              value={state?.settings.showAnimations ?? true}
              onValueChange={async (value) => {
                try {
                  await setShowAnimations(value);
                  Alert.alert(t('success'), t('guidance.animations_setting_saved'));
                } catch (error) {
                  Alert.alert(t('error'), t('guidance.animations_toggle_failed'));
                }
              }}
            />
          </SettingSection>

          {/* Privacy & Analytics */}
          <SettingSection title={t('guidance.privacy_analytics')}>
            <ToggleItem
              icon={analyticsOptIn ? Eye : EyeOff}
              title={t('guidance.analytics_tracking')}
              subtitle={t('guidance.analytics_tracking_subtitle')}
              value={analyticsOptIn}
              onValueChange={handleAnalyticsToggle}
              iconColor={analyticsOptIn ? Colors.primary : '#64748b'}
            />
          </SettingSection>

          {/* Info */}
          <View style={styles.infoCard}>
            <Info size={20} color="#3b82f6" strokeWidth={2} />
            <Text style={styles.infoText}>
              {t('guidance.info_message')}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('guidance.footer_text')}</Text>
          </View>
        </ScrollView>

        {/* Guidance Level Modal */}
        <Modal
          visible={showLevelModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLevelModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowLevelModal(false)}
          >
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('guidance.choose_level')}</Text>
                <TouchableOpacity onPress={() => setShowLevelModal(false)}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Full Guidance */}
              <TouchableOpacity
                style={[
                  styles.levelOption,
                  currentLevel === 'full' && styles.levelOptionSelected,
                ]}
                onPress={() => handleGuidanceLevelChange('full')}
              >
                <View style={styles.levelOptionLeft}>
                  <View style={[styles.levelIcon, { backgroundColor: '#10b98115' }]}>
                    <Sparkles size={24} color={Colors.primary} strokeWidth={2} />
                  </View>
                  <View style={styles.levelOptionText}>
                    <Text style={styles.levelOptionTitle}>{t('guidance.level_full')}</Text>
                    <Text style={styles.levelOptionDescription}>
                      {t('guidance.level_full_description')}
                    </Text>
                  </View>
                </View>
                {currentLevel === 'full' && <CheckCircle size={24} color={Colors.primary} />}
              </TouchableOpacity>

              {/* Minimal Guidance */}
              <TouchableOpacity
                style={[
                  styles.levelOption,
                  currentLevel === 'minimal' && styles.levelOptionSelected,
                ]}
                onPress={() => handleGuidanceLevelChange('minimal')}
              >
                <View style={styles.levelOptionLeft}>
                  <View style={[styles.levelIcon, { backgroundColor: '#f59e0b15' }]}>
                    <Zap size={24} color="#f59e0b" strokeWidth={2} />
                  </View>
                  <View style={styles.levelOptionText}>
                    <Text style={styles.levelOptionTitle}>{t('guidance.level_minimal')}</Text>
                    <Text style={styles.levelOptionDescription}>
                      {t('guidance.level_minimal_description')}
                    </Text>
                  </View>
                </View>
                {currentLevel === 'minimal' && <CheckCircle size={24} color="#f59e0b" />}
              </TouchableOpacity>

              {/* Off */}
              <TouchableOpacity
                style={[
                  styles.levelOption,
                  currentLevel === 'off' && styles.levelOptionSelected,
                ]}
                onPress={() => handleGuidanceLevelChange('off')}
              >
                <View style={styles.levelOptionLeft}>
                  <View style={[styles.levelIcon, { backgroundColor: '#64748b15' }]}>
                    <EyeOff size={24} color="#64748b" strokeWidth={2} />
                  </View>
                  <View style={styles.levelOptionText}>
                    <Text style={styles.levelOptionTitle}>{t('guidance.level_off')}</Text>
                    <Text style={styles.levelOptionDescription}>
                      {t('guidance.level_off_description')}
                    </Text>
                  </View>
                </View>
                {currentLevel === 'off' && <CheckCircle size={24} color="#64748b" />}
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Tour List Modal */}
        <Modal
          visible={showTourListModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTourListModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTourListModal(false)}
          >
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('guidance.select_tutorial')}</Text>
                <TouchableOpacity onPress={() => setShowTourListModal(false)}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.tourList}>
                {availableTours.map((tour) => {
                  const isCompleted = state?.completedTours.includes(tour.id);
                  return (
                    <TouchableOpacity
                      key={tour.id}
                      style={styles.tourItem}
                      onPress={() => handleResetSpecificTour(tour.id, tour.name)}
                    >
                      <View style={styles.tourItemLeft}>
                        {isCompleted ? (
                          <CheckCircle size={20} color={Colors.primary} />
                        ) : (
                          <Circle size={20} color="#cbd5e1" />
                        )}
                        <Text style={[styles.tourItemText, isCompleted && styles.tourItemCompleted]}>
                          {tour.name}
                        </Text>
                      </View>
                      <RotateCcw size={18} color="#64748b" />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Reset Confirmation Modal */}
        <Modal
          visible={showResetModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowResetModal(false)}
        >
          <View style={styles.confirmModalOverlay}>
            <View style={styles.confirmModal}>
              <View style={styles.confirmIconContainer}>
                <RotateCcw size={32} color="#ef4444" strokeWidth={2} />
              </View>
              <Text style={styles.confirmTitle}>{t('guidance.reset_all_title')}</Text>
              <Text style={styles.confirmMessage}>{t('guidance.reset_all_confirm')}</Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.confirmButtonCancel]}
                  onPress={() => setShowResetModal(false)}
                >
                  <Text style={styles.confirmButtonTextCancel}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.confirmButtonConfirm]}
                  onPress={handleResetAllGuidance}
                >
                  <Text style={styles.confirmButtonTextConfirm}>{t('guidance.reset')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  statusCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  statusLevel: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
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
    maxHeight: '80%',
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
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  levelOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#f0fdf4',
  },
  levelOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelOptionText: {
    flex: 1,
  },
  levelOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  levelOptionDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  tourList: {
    maxHeight: 400,
  },
  tourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tourItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tourItemText: {
    fontSize: 15,
    color: '#1e293b',
    marginLeft: 12,
  },
  tourItemCompleted: {
    color: '#64748b',
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  confirmIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonCancel: {
    backgroundColor: '#f1f5f9',
  },
  confirmButtonConfirm: {
    backgroundColor: '#ef4444',
  },
  confirmButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  confirmButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
