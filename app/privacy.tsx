import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function PrivacyScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const isFrench = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().startsWith('fr');
  const txt = (fr: string, en: string) => (isFrench ? fr : en);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{txt('Politique de confidentialité', 'Privacy Policy')}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.date}>{txt('Dernière mise à jour : Janvier 2025', 'Last updated: January 2025')}</Text>

            <Text style={styles.intro}>
              {txt('Chez Marché.cd, nous prenons votre vie privée au sérieux. Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles.', 'At Marché.cd, we take your privacy seriously. This policy explains how we collect, use, and protect your personal data.')}
            </Text>

            <Text style={styles.sectionTitle}>{txt('1. Informations collectées', '1. Information collected')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                "Nous collectons les informations suivantes :\n\n• Nom et prénom\n• Adresse email\n• Numéro de téléphone (WhatsApp)\n• Ville/localisation\n• Photo de profil (optionnel)\n• Contenu des annonces publiées\n• Messages échangés sur la plateforme",
                'We collect the following information:\n\n• First and last name\n• Email address\n• Phone number (WhatsApp)\n• City/location\n• Profile picture (optional)\n• Published listing content\n• Messages exchanged on the platform'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('2. Utilisation des données', '2. Data usage')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                'Nous utilisons vos données pour :\n\n• Créer et gérer votre compte\n• Publier vos annonces\n• Faciliter la communication entre acheteurs et vendeurs\n• Améliorer nos services\n• Vous envoyer des notifications importantes\n• Prévenir la fraude et les abus',
                'We use your data to:\n\n• Create and manage your account\n• Publish your listings\n• Facilitate communication between buyers and sellers\n• Improve our services\n• Send you important notifications\n• Prevent fraud and abuse'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('3. Partage des données', '3. Data sharing')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                'Nous ne vendons jamais vos données personnelles. Vos informations peuvent être visibles par :\n\n• Les autres utilisateurs (nom, photo, ville, annonces)\n• Les personnes avec qui vous échangez des messages\n\nNous ne partageons pas vos données avec des tiers à des fins marketing.',
                'We never sell your personal data. Your information may be visible to:\n\n• Other users (name, photo, city, listings)\n• People you exchange messages with\n\nWe do not share your data with third parties for marketing purposes.'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('4. Sécurité des données', '4. Data security')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                'Nous utilisons des mesures de sécurité pour protéger vos données :\n\n• Chiffrement des données sensibles\n• Serveurs sécurisés\n• Accès restreint aux données\n• Surveillance continue de la sécurité',
                'We use security measures to protect your data:\n\n• Encryption of sensitive data\n• Secure servers\n• Restricted access to data\n• Continuous security monitoring'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('5. Vos droits', '5. Your rights')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                'Vous avez le droit de :\n\n• Accéder à vos données personnelles\n• Modifier vos informations\n• Supprimer votre compte\n• Exporter vos données\n• Vous opposer au traitement de vos données',
                'You have the right to:\n\n• Access your personal data\n• Update your information\n• Delete your account\n• Export your data\n• Object to data processing'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('6. Cookies et tracking', '6. Cookies and tracking')}</Text>
            <Text style={styles.paragraph}>
              {txt('Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.', 'We use cookies to improve your experience. You can disable cookies in your browser settings.')}
            </Text>

            <Text style={styles.sectionTitle}>{txt('7. Conservation des données', '7. Data retention')}</Text>
            <Text style={styles.paragraph}>
              {txt('Nous conservons vos données tant que votre compte est actif. Si vous supprimez votre compte, vos données seront supprimées dans les 30 jours.', 'We retain your data while your account is active. If you delete your account, your data will be removed within 30 days.')}
            </Text>

            <Text style={styles.sectionTitle}>{txt('8. Modifications', '8. Changes')}</Text>
            <Text style={styles.paragraph}>
              {txt('Nous pouvons modifier cette politique à tout moment. Nous vous informerons des changements importants par email ou notification.', 'We may update this policy at any time. We will notify you of major changes by email or notification.')}
            </Text>

            <Text style={styles.sectionTitle}>{txt('9. Contact', '9. Contact')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                'Pour toute question sur cette politique ou pour exercer vos droits, contactez-nous :\n\nWhatsApp : +27 67 272 7343\nEmail : support@marchecd.tech',
                'For any questions about this policy or to exercise your rights, contact us:\n\nWhatsApp: +27 67 272 7343\nEmail: support@marchecd.tech'
              )}
            </Text>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {txt('En utilisant Marché.cd, vous acceptez cette politique de confidentialité.', 'By using Marché.cd, you agree to this privacy policy.')}
              </Text>
            </View>
          </View>
        </ScrollView>
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
    backgroundColor: '#fff',
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  date: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  intro: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  footer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
