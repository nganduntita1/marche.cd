import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Share,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Copy,
  Share2,
  Users,
  DollarSign,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { ReferralCode, ReferralCommission, ReferredUser } from '@/types/referral';

interface ReferralStats {
  totalReferrals: number;
  totalCommissionEarned: number;
  totalCommissionCredits: number;
  paidCommission: number;
  paidCommissionCredits: number;
  pendingCommission: number;
  referralCode: ReferralCode | null;
}

export default function ReferralDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isFrench = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().startsWith('fr');
  const txt = (fr: string, en: string) => (isFrench ? fr : en);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalCommissionEarned: 0,
    totalCommissionCredits: 0,
    paidCommission: 0,
    paidCommissionCredits: 0,
    pendingCommission: 0,
    referralCode: null,
  });
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);

      if (!user?.id) return;

      // Fetch referral code
      const { data: referralCodes, error: referralCodeError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (referralCodeError) {
        throw referralCodeError;
      }

      const referralCode = referralCodes?.[0] ?? null;

      // Fetch referral stats and commissions
      const { data: commissionsData } = await supabase
        .from('referral_commissions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch referred users
      let referredUsersData: ReferredUser[] = [];
      if (referralCode) {
        const { data: signups } = await supabase
          .from('referral_signups')
          .select('referred_user_id, used_at')
          .eq('referral_code_id', referralCode.id);

        if (signups && signups.length > 0) {
          const userIds = signups.map((s) => s.referred_user_id);

          const { data: users } = await supabase
            .from('users')
            .select('id, name, email, phone')
            .in('id', userIds);

          referredUsersData = signups.map((signup) => {
            const userData = users?.find((u) => u.id === signup.referred_user_id);
            const userCommissions = commissionsData?.filter(
              (c) => c.referred_user_id === signup.referred_user_id
            );

            return {
              id: signup.referred_user_id,
              name: userData?.name || 'Unknown',
              email: userData?.email || null,
              phone: userData?.phone || '',
              purchaseAmount:
                userCommissions && userCommissions.length > 0
                  ? userCommissions.reduce((sum, c) => sum + c.commission_amount, 0)
                  : null,
              purchaseStatus:
                userCommissions && userCommissions.length > 0
                  ? userCommissions[0].source_purchase_id
                    ? 'completed'
                    : 'pending'
                  : 'no_purchase',
              referredAt: signup.used_at,
              commissionStatus:
                userCommissions && userCommissions.length > 0
                  ? userCommissions[0].status
                  : 'no_purchase',
            };
          });
        }
      }

      // Calculate stats
      const totalCommission = commissionsData?.reduce((sum, c) => sum + c.commission_amount, 0) || 0;
      const totalCommissionCredits = commissionsData?.reduce((sum, c) => sum + c.commission_credits, 0) || 0;
      const paidCommission = commissionsData
        ?.filter((c) => c.status === 'paid')
        .reduce((sum, c) => sum + c.commission_amount, 0) || 0;
      const paidCommissionCredits = commissionsData
        ?.filter((c) => c.status === 'paid')
        .reduce((sum, c) => sum + c.commission_credits, 0) || 0;
      const pendingCommission = commissionsData
        ?.filter((c) => c.status !== 'paid')
        .reduce((sum, c) => sum + c.commission_amount, 0) || 0;

      setStats({
        totalReferrals: referredUsersData.length,
        totalCommissionEarned: totalCommission,
        totalCommissionCredits: totalCommissionCredits,
        paidCommission: paidCommission,
        paidCommissionCredits: paidCommissionCredits,
        pendingCommission: pendingCommission,
        referralCode: referralCode || null,
      });

      setReferredUsers(referredUsersData);
      setCommissions(commissionsData || []);
    } catch (error) {
      console.error('Error loading referral data:', error);
      Alert.alert(txt('Erreur', 'Error'), txt('Impossible de charger les données de parrainage.', 'Failed to load referral data.'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReferralData();
    setRefreshing(false);
  };

  const handleGenerateCode = async () => {
    try {
      setGeneratingCode(true);

      const { data: authData } = await supabase.auth.getSession();
      const token = authData?.session?.access_token;

      if (!token) {
        Alert.alert(txt('Erreur', 'Error'), txt('Authentification requise.', 'Authentication required.'));
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-referral-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate code');
      }

      if (Platform.OS === 'web') {
        (document.activeElement as HTMLElement | null)?.blur?.();
      }

      Alert.alert(
        txt('Succès', 'Success'),
        data.isNew
          ? txt('Code de parrainage généré avec succès !', 'Referral code generated successfully!')
          : txt('Vous avez déjà un code de parrainage.', 'You already have a referral code.')
      );

      await loadReferralData();
    } catch (error) {
      console.error('Error generating code:', error);
      if (Platform.OS === 'web') {
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
      Alert.alert(txt('Erreur', 'Error'), txt('Impossible de générer le code.', 'Failed to generate code.'));
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (stats.referralCode?.code) {
      try {
        // Copy to clipboard (using React Native)
        Share.share({
          message: `${txt('Rejoignez-moi sur Marché!', 'Join me on Marché!')} ${txt('Utilisez mon code de parrainage:', 'Use my referral code:')} ${stats.referralCode.code}`,
          title: txt('Code de Parrainage Marché', 'Marché Referral Code'),
        });
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (error) {
        console.error('Error copying code:', error);
      }
    }
  };

  const handleShareCode = async () => {
    if (stats.referralCode?.code) {
      try {
        await Share.share({
          message: `${txt('Rejoignez-moi sur Marché!', 'Join me on Marché!')} ${txt('Utilisez mon code de parrainage:', 'Use my referral code:')} ${stats.referralCode.code}`,
          title: txt('Code de Parrainage Marché', 'Marché Referral Code'),
          url: undefined,
        });
      } catch (error) {
        console.error('Error sharing code:', error);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft width={24} height={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{txt('Parrainage', 'Referrals')}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Referral Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{txt('Votre Code de Parrainage', 'Your Referral Code')}</Text>

          {stats.referralCode ? (
            <View style={styles.codeCard}>
              <View style={styles.codeContent}>
                <Text style={styles.codeLabel}>{txt('Code:', 'Code:')}</Text>
                <Text style={styles.codeValue}>{stats.referralCode.code}</Text>
              </View>
              <View style={styles.codeActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.copyButton]}
                  onPress={handleCopyCode}
                >
                  <Copy width={18} height={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={handleShareCode}
                >
                  <Share2 width={18} height={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noCodeCard}>
              <AlertCircle width={24} height={24} color={Colors.primary} />
              <Text style={styles.noCodeText}>
                {txt('Vous n\'avez pas encore de code de parrainage. Créez-en un maintenant!', 'You don\'t have a referral code yet. Create one now!')}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.generateButton, generatingCode && styles.generateButtonDisabled]}
            onPress={handleGenerateCode}
            disabled={generatingCode}
          >
            {generatingCode ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <RefreshCw width={18} height={18} color="white" />
                <Text style={styles.generateButtonText}>
                  {stats.referralCode
                    ? txt('Régénérer le Code', 'Regenerate Code')
                    : txt('Générer un Code', 'Generate Code')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{txt('Statistiques', 'Statistics')}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Users width={24} height={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats.totalReferrals}</Text>
              <Text style={styles.statLabel}>{txt('Parrainages', 'Referrals')}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <DollarSign width={24} height={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>${stats.totalCommissionEarned.toFixed(2)}</Text>
              <Text style={styles.statLabel}>{txt('Commissions', 'Commissions')}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Zap width={24} height={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats.totalCommissionCredits}</Text>
              <Text style={styles.statLabel}>{txt('Crédits Gagnés', 'Credits Earned')}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <CheckCircle width={24} height={24} color={Colors.success} />
              </View>
              <Text style={styles.statValue}>${stats.paidCommission.toFixed(2)}</Text>
              <Text style={styles.statLabel}>{txt('Payé', 'Paid')}</Text>
            </View>
          </View>

          {stats.pendingCommission > 0 && (
            <View style={styles.pendingCommissionCard}>
              <Clock width={20} height={20} color={Colors.warning} />
              <View style={styles.pendingContent}>
                <Text style={styles.pendingLabel}>{txt('En Attente', 'Pending')}</Text>
                <Text style={styles.pendingAmount}>${stats.pendingCommission.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Referred Users Section */}
        {referredUsers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{txt('Utilisateurs Parrainés', 'Referred Users')}</Text>

            {referredUsers.map((referredUser) => (
              <View key={referredUser.id} style={styles.referralCard}>
                <View style={styles.referralInfo}>
                  <Text style={styles.referralName}>{referredUser.name}</Text>
                  <Text style={styles.referralDate}>
                    {txt('Rejeint le:', 'Joined:')} {new Date(referredUser.referredAt).toLocaleDateString()}
                  </Text>
                  <View style={styles.referralStatus}>
                    {referredUser.purchaseStatus === 'completed' ? (
                      <>
                        <CheckCircle width={16} height={16} color={Colors.success} />
                        <Text style={styles.statusText}>{txt('Achat Effectué', 'Purchase Made')}</Text>
                      </>
                    ) : (
                      <>
                        <Clock width={16} height={16} color={Colors.warning} />
                        <Text style={styles.statusText}>{txt('En Attente d\'Achat', 'Awaiting Purchase')}</Text>
                      </>
                    )}
                  </View>
                </View>
                {referredUser.purchaseAmount !== null && (
                  <View style={styles.referralCommission}>
                    <Text style={styles.commissionLabel}>{txt('Commission:', 'Commission:')}</Text>
                    <Text style={styles.commissionAmount}>${referredUser.purchaseAmount.toFixed(2)}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {referredUsers.length === 0 && (
          <View style={styles.section}>
            <View style={styles.emptyState}>
              <Users width={48} height={48} color={Colors.gray300} />
              <Text style={styles.emptyStateTitle}>
                {txt('Aucun Parrainage Encore', 'No Referrals Yet')}
              </Text>
              <Text style={styles.emptyStateText}>
                {txt(
                  'Partagez votre code pour commencer à gagner des commissions!',
                  'Share your code to start earning commissions!'
                )}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  codeCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeContent: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 2,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButton: {
    backgroundColor: `${Colors.primary}20`,
  },
  shareButton: {
    backgroundColor: Colors.primary,
  },
  noCodeCard: {
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noCodeText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  generateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pendingCommissionCard: {
    backgroundColor: `${Colors.warning}15`,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pendingContent: {
    flex: 1,
  },
  pendingLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
  },
  referralCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  referralStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  referralCommission: {
    alignItems: 'flex-end',
  },
  commissionLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  commissionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
});
