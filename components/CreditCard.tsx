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

type CreditCardProps = {
  credits: number;
  amount: number;
};

export default function CreditCard({ credits, amount }: CreditCardProps) {
  const { user } = useAuth();

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
    <TouchableOpacity style={styles.card} onPress={handlePurchase}>
      <View style={styles.content}>
        <Text style={styles.credits}>{credits} crédits</Text>
        <Text style={styles.price}>${amount}</Text>
        <Text style={styles.pricePerCredit}>
          ${(amount / credits).toFixed(2)} par crédit
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePurchase}>
        <Text style={styles.buttonText}>Acheter sur WhatsApp</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
  },
  content: {
    alignItems: 'center',
    marginBottom: 16,
  },
  credits: {
    fontSize: 24,
    fontWeight: '600',
    color: '#9bbd1f',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  pricePerCredit: {
    fontSize: 14,
    color: '#64748b',
  },
  button: {
    backgroundColor: '#9bbd1f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});