import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function HelpCenterScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Comment publier une annonce ?',
      answer: 'Pour publier une annonce, allez dans l\'onglet "Publier", remplissez les informations (titre, description, prix, photos), sélectionnez une catégorie et cliquez sur "Publier". Chaque annonce coûte 1 crédit.',
    },
    {
      question: 'Comment acheter des crédits ?',
      answer: 'Allez dans votre profil, section "Acheter des crédits". Choisissez un pack et contactez-nous via WhatsApp pour finaliser l\'achat. Vos crédits seront ajoutés immédiatement après paiement.',
    },
    {
      question: 'Comment contacter un vendeur ?',
      answer: 'Sur la page d\'une annonce, cliquez sur le bouton de message pour démarrer une conversation avec le vendeur. Vous pouvez discuter directement dans l\'app.',
    },
    {
      question: 'Comment marquer une annonce comme vendue ?',
      answer: 'Dans votre profil, trouvez l\'annonce et cliquez sur "Marquer vendu". L\'annonce sera marquée comme vendue mais restera visible dans votre historique.',
    },
    {
      question: 'Comment modifier mon profil ?',
      answer: 'Allez dans Profil > Modifier mon profil. Vous pouvez changer votre photo, nom, numéro WhatsApp et ville.',
    },
    {
      question: 'Les annonces expirent-elles ?',
      answer: 'Non, vos annonces restent actives jusqu\'à ce que vous les marquiez comme vendues ou les supprimiez.',
    },
    {
      question: 'Comment signaler une annonce suspecte ?',
      answer: 'Contactez notre support via WhatsApp avec le lien de l\'annonce. Nous examinerons et prendrons les mesures appropriées.',
    },
    {
      question: 'Puis-je modifier une annonce après publication ?',
      answer: 'Oui, dans votre profil, cliquez sur l\'icône de modification sur votre annonce pour la modifier.',
    },
    {
      question: 'Comment supprimer mon compte ?',
      answer: 'Allez dans Paramètres > Zone de danger > Supprimer le compte. Cette action est irréversible.',
    },
    {
      question: 'Marché.cd prend-il une commission ?',
      answer: 'Non, nous ne prenons aucune commission sur vos ventes. Vous payez uniquement pour publier l\'annonce (1 crédit).',
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Centre d'aide</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={styles.introTitle}>Questions fréquentes</Text>
            <Text style={styles.introText}>
              Trouvez rapidement des réponses à vos questions
            </Text>
          </View>

          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                {expandedIndex === index ? (
                  <ChevronUp size={20} color="#9bbd1f" />
                ) : (
                  <ChevronDown size={20} color="#64748b" />
                )}
              </TouchableOpacity>
              
              {expandedIndex === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Besoin d'aide supplémentaire ?</Text>
            <Text style={styles.contactText}>
              Notre équipe est disponible pour vous aider
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => router.back()}
            >
              <Text style={styles.contactButtonText}>Contacter le support</Text>
            </TouchableOpacity>
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
  intro: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },
  faqItem: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#9bbd1f',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
