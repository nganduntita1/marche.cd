import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles } from 'lucide-react-native';

type CreditCardProps = {
  credits: number;
  amount: number;
};

export default function CreditCard({ credits, amount }: CreditCardProps) {
  const { user } = useAuth();
  const isPopular = credits === 30; // Middle option is popular

  const handlePurchase = async () => {
    if (!user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour acheter des crédits.');
      return;
    }

    try {
      // Log the purchase attempt
      const { error } = await supabase
        .from('credit_purchases')
        .insert({
          user_id: user.id,
          credits: credits,
          amount: amount,
          status: 'pending',
        });

      if (error) throw error;

      // Open WhatsApp with prefilled message
      const message = `Bonjour, je souhaite acheter ${credits} crédits pour ${amount}$ sur Marché.cd. Mon ID utilisateur est ${user.id}.`;
      const whatsappUrl = `https://wa.me/27672727343?text=${encodeURIComponent(message)}`;
      
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp');
      }
    } catch (error) {
      console.error('Error logging purchase:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement de votre achat.');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, isPopular && styles.cardPopular]} 
      onPress={handlePurchase}
      activeOpacity={0.7}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Sparkles size={12} color="#fff" fill="#fff" />
          <Text style={styles.popularText}>Populaire</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.creditsRow}>
          <Text style={styles.credits}>{credits}</Text>
          <Text style={styles.creditsLabel}>crédits</Text>
        </View>
        <Text style={styles.price}>${amount}</Text>
        <View style={styles.perCreditBadge}>
          <Text style={styles.pricePerCredit}>
            ${(amount / credits).toFixed(2)} / crédit
          </Text>
        </View>
      </View>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Acheter</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    width: '100%',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPopular: {
    borderColor: '#9bbd1f',
    backgroundColor: '#f0fdf4',
    shadowColor: '#9bbd1f',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#9bbd1f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#9bbd1f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    alignItems: 'center',
    marginBottom: 16,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  credits: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 6,
  },
  creditsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#9bbd1f',
    marginBottom: 8,
  },
  perCreditBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pricePerCredit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  button: {
    backgroundColor: '#9bbd1f',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});