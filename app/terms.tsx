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

export default function TermsScreen() {
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
          <Text style={styles.headerTitle}>{txt("Conditions d'utilisation", 'Terms of Use')}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.date}>{txt('Dernière mise à jour : Janvier 2025', 'Last updated: January 2025')}</Text>

            <Text style={styles.sectionTitle}>{txt('1. Acceptation des conditions', '1. Acceptance of terms')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                "En utilisant Marché.cd, vous acceptez ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.",
                'By using Marché.cd, you agree to these terms of use. If you do not agree, please do not use our service.'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('2. Description du service', '2. Service description')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                'Marché.cd est une plateforme de petites annonces permettant aux utilisateurs de publier et consulter des annonces de vente en République Démocratique du Congo.',
                'Marché.cd is a classifieds platform that allows users to publish and browse listings in the Democratic Republic of the Congo.'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('3. Compte utilisateur', '3. User account')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                "• Vous devez fournir des informations exactes lors de l'inscription\n• Vous êtes responsable de la sécurité de votre compte\n• Vous ne pouvez pas partager votre compte avec d'autres\n• Vous devez avoir au moins 18 ans pour utiliser le service",
                '• You must provide accurate information when registering\n• You are responsible for your account security\n• You may not share your account with others\n• You must be at least 18 years old to use the service'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt("4. Publication d'annonces", '4. Listing publication')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                '• Chaque annonce coûte 1 crédit\n• Les annonces doivent être légales et conformes\n• Vous êtes responsable du contenu de vos annonces\n• Nous nous réservons le droit de supprimer toute annonce inappropriée',
                '• Each listing costs 1 credit\n• Listings must be legal and compliant\n• You are responsible for your listing content\n• We reserve the right to remove any inappropriate listing'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('5. Transactions', '5. Transactions')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                "• Les transactions se font directement entre acheteurs et vendeurs\n• Marché.cd n'est pas responsable des transactions\n• Nous ne prenons aucune commission sur les ventes\n• Soyez prudent et suivez nos conseils de sécurité",
                '• Transactions are carried out directly between buyers and sellers\n• Marché.cd is not responsible for transactions\n• We do not take any commission on sales\n• Be careful and follow our safety tips'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('6. Contenu interdit', '6. Prohibited content')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                'Il est interdit de publier :\n• Des produits illégaux ou contrefaits\n• Du contenu offensant ou discriminatoire\n• Des arnaques ou fraudes\n• Des informations fausses ou trompeuses',
                'It is forbidden to publish:\n• Illegal or counterfeit products\n• Offensive or discriminatory content\n• Scams or fraud\n• False or misleading information'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('7. Propriété intellectuelle', '7. Intellectual property')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                "Tout le contenu de Marché.cd (logo, design, code) est protégé par les droits d'auteur. Vous ne pouvez pas copier ou reproduire notre contenu sans autorisation.",
                'All Marché.cd content (logo, design, code) is protected by copyright. You may not copy or reproduce our content without permission.'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('8. Limitation de responsabilité', '8. Limitation of liability')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                'Marché.cd est fourni "tel quel". Nous ne garantissons pas que le service sera ininterrompu ou sans erreur. Nous ne sommes pas responsables des pertes résultant de l\'utilisation du service.',
                'Marché.cd is provided "as is". We do not guarantee uninterrupted or error-free service. We are not responsible for losses resulting from using the service.'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('9. Modifications', '9. Changes')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                'Nous pouvons modifier ces conditions à tout moment. Les modifications seront effectives dès leur publication sur l\'application.',
                'We may modify these terms at any time. Changes become effective as soon as they are published in the app.'
              )}
            </Text>

            <Text style={styles.sectionTitle}>{txt('10. Contact', '10. Contact')}</Text>
            <Text style={styles.paragraph}>
              {txt(
                'Pour toute question concernant ces conditions, contactez-nous via WhatsApp au +27 67 272 7343.',
                'For any questions about these terms, contact us via WhatsApp at +27 67 272 7343.'
              )}
            </Text>
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
    marginBottom: 24,
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
});
