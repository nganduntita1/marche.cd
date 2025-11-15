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

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Politique de confidentialité</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.date}>Dernière mise à jour : Janvier 2025</Text>

            <Text style={styles.intro}>
              Chez Marché.cd, nous prenons votre vie privée au sérieux. Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles.
            </Text>

            <Text style={styles.sectionTitle}>1. Informations collectées</Text>
            <Text style={styles.paragraph}>
              Nous collectons les informations suivantes :{'\n\n'}
              • Nom et prénom{'\n'}
              • Adresse email{'\n'}
              • Numéro de téléphone (WhatsApp){'\n'}
              • Ville/localisation{'\n'}
              • Photo de profil (optionnel){'\n'}
              • Contenu des annonces publiées{'\n'}
              • Messages échangés sur la plateforme
            </Text>

            <Text style={styles.sectionTitle}>2. Utilisation des données</Text>
            <Text style={styles.paragraph}>
              Nous utilisons vos données pour :{'\n\n'}
              • Créer et gérer votre compte{'\n'}
              • Publier vos annonces{'\n'}
              • Faciliter la communication entre acheteurs et vendeurs{'\n'}
              • Améliorer nos services{'\n'}
              • Vous envoyer des notifications importantes{'\n'}
              • Prévenir la fraude et les abus
            </Text>

            <Text style={styles.sectionTitle}>3. Partage des données</Text>
            <Text style={styles.paragraph}>
              Nous ne vendons jamais vos données personnelles. Vos informations peuvent être visibles par :{'\n\n'}
              • Les autres utilisateurs (nom, photo, ville, annonces){'\n'}
              • Les personnes avec qui vous échangez des messages{'\n\n'}
              Nous ne partageons pas vos données avec des tiers à des fins marketing.
            </Text>

            <Text style={styles.sectionTitle}>4. Sécurité des données</Text>
            <Text style={styles.paragraph}>
              Nous utilisons des mesures de sécurité pour protéger vos données :{'\n\n'}
              • Chiffrement des données sensibles{'\n'}
              • Serveurs sécurisés{'\n'}
              • Accès restreint aux données{'\n'}
              • Surveillance continue de la sécurité
            </Text>

            <Text style={styles.sectionTitle}>5. Vos droits</Text>
            <Text style={styles.paragraph}>
              Vous avez le droit de :{'\n\n'}
              • Accéder à vos données personnelles{'\n'}
              • Modifier vos informations{'\n'}
              • Supprimer votre compte{'\n'}
              • Exporter vos données{'\n'}
              • Vous opposer au traitement de vos données
            </Text>

            <Text style={styles.sectionTitle}>6. Cookies et tracking</Text>
            <Text style={styles.paragraph}>
              Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.
            </Text>

            <Text style={styles.sectionTitle}>7. Conservation des données</Text>
            <Text style={styles.paragraph}>
              Nous conservons vos données tant que votre compte est actif. Si vous supprimez votre compte, vos données seront supprimées dans les 30 jours.
            </Text>

            <Text style={styles.sectionTitle}>8. Modifications</Text>
            <Text style={styles.paragraph}>
              Nous pouvons modifier cette politique à tout moment. Nous vous informerons des changements importants par email ou notification.
            </Text>

            <Text style={styles.sectionTitle}>9. Contact</Text>
            <Text style={styles.paragraph}>
              Pour toute question sur cette politique ou pour exercer vos droits, contactez-nous :{'\n\n'}
              WhatsApp : +27 67 272 7343{'\n'}
              Email : support@marche.cd
            </Text>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                En utilisant Marché.cd, vous acceptez cette politique de confidentialité.
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
