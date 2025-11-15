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

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.date}>Dernière mise à jour : Janvier 2025</Text>

            <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
            <Text style={styles.paragraph}>
              En utilisant Marché.cd, vous acceptez ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </Text>

            <Text style={styles.sectionTitle}>2. Description du service</Text>
            <Text style={styles.paragraph}>
              Marché.cd est une plateforme de petites annonces permettant aux utilisateurs de publier et consulter des annonces de vente en République Démocratique du Congo.
            </Text>

            <Text style={styles.sectionTitle}>3. Compte utilisateur</Text>
            <Text style={styles.paragraph}>
              • Vous devez fournir des informations exactes lors de l'inscription{'\n'}
              • Vous êtes responsable de la sécurité de votre compte{'\n'}
              • Vous ne pouvez pas partager votre compte avec d'autres{'\n'}
              • Vous devez avoir au moins 18 ans pour utiliser le service
            </Text>

            <Text style={styles.sectionTitle}>4. Publication d'annonces</Text>
            <Text style={styles.paragraph}>
              • Chaque annonce coûte 1 crédit{'\n'}
              • Les annonces doivent être légales et conformes{'\n'}
              • Vous êtes responsable du contenu de vos annonces{'\n'}
              • Nous nous réservons le droit de supprimer toute annonce inappropriée
            </Text>

            <Text style={styles.sectionTitle}>5. Transactions</Text>
            <Text style={styles.paragraph}>
              • Les transactions se font directement entre acheteurs et vendeurs{'\n'}
              • Marché.cd n'est pas responsable des transactions{'\n'}
              • Nous ne prenons aucune commission sur les ventes{'\n'}
              • Soyez prudent et suivez nos conseils de sécurité
            </Text>

            <Text style={styles.sectionTitle}>6. Contenu interdit</Text>
            <Text style={styles.paragraph}>
              Il est interdit de publier :{'\n'}
              • Des produits illégaux ou contrefaits{'\n'}
              • Du contenu offensant ou discriminatoire{'\n'}
              • Des arnaques ou fraudes{'\n'}
              • Des informations fausses ou trompeuses
            </Text>

            <Text style={styles.sectionTitle}>7. Propriété intellectuelle</Text>
            <Text style={styles.paragraph}>
              Tout le contenu de Marché.cd (logo, design, code) est protégé par les droits d'auteur. Vous ne pouvez pas copier ou reproduire notre contenu sans autorisation.
            </Text>

            <Text style={styles.sectionTitle}>8. Limitation de responsabilité</Text>
            <Text style={styles.paragraph}>
              Marché.cd est fourni "tel quel". Nous ne garantissons pas que le service sera ininterrompu ou sans erreur. Nous ne sommes pas responsables des pertes résultant de l'utilisation du service.
            </Text>

            <Text style={styles.sectionTitle}>9. Modifications</Text>
            <Text style={styles.paragraph}>
              Nous pouvons modifier ces conditions à tout moment. Les modifications seront effectives dès leur publication sur l'application.
            </Text>

            <Text style={styles.sectionTitle}>10. Contact</Text>
            <Text style={styles.paragraph}>
              Pour toute question concernant ces conditions, contactez-nous via WhatsApp au +27 67 272 7343.
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
