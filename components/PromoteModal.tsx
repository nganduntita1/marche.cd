import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Sparkles, Clock, Zap } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';

interface PromoteModalProps {
  visible: boolean;
  onClose: () => void;
  listingId: string;
  onSuccess: () => void;
}

const PROMOTION_PLANS = [
  { days: 7, credits: 10, label: '7 jours', savings: 0 },
  { days: 14, credits: 18, label: '14 jours', popular: true, savings: 2 },
  { days: 30, credits: 30, label: '30 jours', savings: 10 },
];

export default function PromoteModal({
  visible,
  onClose,
  listingId,
  onSuccess,
}: PromoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(PROMOTION_PLANS[1]);

  const handlePromote = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase.rpc('promote_listing', {
        p_listing_id: listingId,
        p_user_id: user.id,
        p_duration_days: selectedPlan.days,
        p_credits_cost: selectedPlan.credits,
      });

      if (error) throw error;

      Alert.alert(
        'Succès! 🎉',
        `Votre annonce est maintenant promue pour ${selectedPlan.days} jours!`
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message === 'Insufficient credits'
          ? 'Crédits insuffisants. Veuillez recharger votre compte.'
          : 'Impossible de promouvoir l\'annonce'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Promouvoir l'annonce</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Benefits Card */}
            <View style={styles.benefitsCard}>
              <Sparkles size={24} color={Colors.primary} />
              <Text style={styles.benefitsTitle}>Avantages de la promotion</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Zap size={16} color={Colors.primary} />
                  <Text style={styles.benefitText}>Apparaît en haut des résultats</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Zap size={16} color={Colors.primary} />
                  <Text style={styles.benefitText}>Badge "Promu" visible</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Zap size={16} color={Colors.primary} />
                  <Text style={styles.benefitText}>3x plus de visibilité</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Zap size={16} color={Colors.primary} />
                  <Text style={styles.benefitText}>Plus de messages reçus</Text>
                </View>
              </View>
            </View>

            {/* Plans */}
            <Text style={styles.plansTitle}>Choisissez une durée</Text>

            {PROMOTION_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.days}
                style={[
                  styles.planCard,
                  selectedPlan.days === plan.days && styles.planCardActive,
                ]}
                onPress={() => setSelectedPlan(plan)}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Populaire</Text>
                  </View>
                )}
                <View style={styles.planLeft}>
                  <View style={styles.planInfo}>
                    <Clock size={20} color={selectedPlan.days === plan.days ? Colors.primary : '#64748b'} />
                    <Text style={[
                      styles.planLabel,
                      selectedPlan.days === plan.days && styles.planLabelActive
                    ]}>
                      {plan.label}
                    </Text>
                  </View>
                  {plan.savings > 0 && (
                    <Text style={styles.savingsText}>Économisez {plan.savings} crédits</Text>
                  )}
                </View>
                <View style={styles.planRight}>
                  <Text style={[
                    styles.planCredits,
                    selectedPlan.days === plan.days && styles.planCreditsActive
                  ]}>
                    {plan.credits}
                  </Text>
                  <Text style={styles.creditsLabel}>crédits</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Promote Button */}
            <TouchableOpacity
              style={[styles.promoteButton, loading && styles.promoteButtonDisabled]}
              onPress={handlePromote}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Sparkles size={20} color="#fff" />
                  <Text style={styles.promoteButtonText}>
                    Promouvoir ({selectedPlan.credits} crédits)
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              La promotion commence immédiatement et dure {selectedPlan.days} jours
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  benefitsCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  plansTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  planCardActive: {
    backgroundColor: '#f0fdf4',
    borderColor: Colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  planLeft: {
    flex: 1,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  planLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  planLabelActive: {
    color: '#1e293b',
  },
  savingsText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planCredits: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748b',
  },
  planCreditsActive: {
    fontSize: 24,
    color: Colors.primary,
  },
  creditsLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  promoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  promoteButtonDisabled: {
    opacity: 0.5,
  },
  promoteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  disclaimer: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
  },
});
