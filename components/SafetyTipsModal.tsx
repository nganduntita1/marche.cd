import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Shield, MessageCircle, MapPin, Phone, AlertTriangle, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

interface SafetyTipsModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export default function SafetyTipsModal({ visible, onClose, onProceed }: SafetyTipsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Shield size={32} color={Colors.primary} />
            <Text style={styles.title}>Conseils pour une transaction réussie</Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.tip}>
              <View style={styles.tipIcon}>
                <MessageCircle size={20} color={Colors.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>1. Commencez par un message poli</Text>
                <Text style={styles.tipText}>
                  Présentez-vous et posez des questions sur le produit. Soyez respectueux et clair.
                </Text>
              </View>
            </View>

            <View style={styles.tip}>
              <View style={styles.tipIcon}>
                <CheckCircle size={20} color={Colors.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>2. Négociez avec respect</Text>
                <Text style={styles.tipText}>
                  Proposez un prix raisonnable. Le vendeur peut refuser, mais restez courtois.
                </Text>
              </View>
            </View>

            <View style={styles.tip}>
              <View style={styles.tipIcon}>
                <Phone size={20} color={Colors.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>3. Échangez les numéros après accord</Text>
                <Text style={styles.tipText}>
                  Une fois d'accord sur le prix et les détails, échangez vos numéros WhatsApp pour finaliser.
                </Text>
              </View>
            </View>

            <View style={styles.tip}>
              <View style={styles.tipIcon}>
                <MapPin size={20} color={Colors.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>4. Choisissez un lieu public</Text>
                <Text style={styles.tipText}>
                  Rencontrez-vous dans un endroit sûr et public (centre commercial, station-service, etc.).
                </Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <AlertTriangle size={20} color="#dc2626" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>⚠️ Important</Text>
                <Text style={styles.warningText}>
                  Ne payez jamais avant d'avoir vu et vérifié le produit en personne.
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={onClose}
            >
              <Text style={styles.secondaryButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={onProceed}
            >
              <Text style={styles.primaryButtonText}>J'ai compris, continuer</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...TextStyles.h4,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 12,
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...TextStyles.bodyBold,
    color: Colors.text,
    marginBottom: 4,
  },
  tipText: {
    ...TextStyles.body,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    ...TextStyles.bodyBold,
    color: '#dc2626',
    marginBottom: 4,
  },
  warningText: {
    ...TextStyles.body,
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.gray50,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    ...TextStyles.button,
    color: Colors.textSecondary,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    ...TextStyles.button,
    color: '#fff',
  },
});
