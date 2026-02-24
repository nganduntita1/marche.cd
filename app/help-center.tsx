import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, Search, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

export default function HelpCenterScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const language = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';

  const faqsData = {
    fr: [
      {
        question: 'Comment publier une annonce ?',
        answer: 'Pour publier une annonce, allez dans l\'onglet "Publier", remplissez les informations (titre, description, prix, photos), sélectionnez une catégorie et cliquez sur "Publier". Chaque annonce coûte 1 crédit.',
        category: 'Vendre',
      },
      {
        question: 'Comment acheter des crédits ?',
        answer: 'Allez dans votre profil, section "Acheter des crédits". Choisissez un pack et contactez-nous via WhatsApp pour finaliser l\'achat. Vos crédits seront ajoutés immédiatement après paiement.',
        category: 'Compte',
      },
      {
        question: 'Comment contacter un vendeur ?',
        answer: 'Sur la page d\'une annonce, cliquez sur le bouton de message pour démarrer une conversation avec le vendeur. Vous pouvez discuter directement dans l\'app.',
        category: 'Acheter',
      },
      {
        question: 'Comment marquer une annonce comme vendue ?',
        answer: 'Dans votre profil, trouvez l\'annonce et cliquez sur "Marquer vendu". L\'annonce sera marquée comme vendue mais restera visible dans votre historique.',
        category: 'Vendre',
      },
      {
        question: 'Comment modifier mon profil ?',
        answer: 'Allez dans Profil > Modifier mon profil. Vous pouvez changer votre photo, nom, numéro WhatsApp et ville.',
        category: 'Compte',
      },
      {
        question: 'Les annonces expirent-elles ?',
        answer: 'Non, vos annonces restent actives jusqu\'à ce que vous les marquiez comme vendues ou les supprimiez.',
        category: 'Vendre',
      },
      {
        question: 'Comment signaler une annonce suspecte ?',
        answer: 'Contactez notre support via WhatsApp avec le lien de l\'annonce. Nous examinerons et prendrons les mesures appropriées.',
        category: 'Sécurité',
      },
      {
        question: 'Puis-je modifier une annonce après publication ?',
        answer: 'Oui, dans votre profil, cliquez sur l\'icône de modification sur votre annonce pour la modifier.',
        category: 'Vendre',
      },
      {
        question: 'Comment supprimer mon compte ?',
        answer: 'Allez dans Paramètres > Zone de danger > Supprimer le compte. Cette action est irréversible.',
        category: 'Compte',
      },
      {
        question: 'Marché.cd prend-il une commission ?',
        answer: 'Non, nous ne prenons aucune commission sur vos ventes. Vous payez uniquement pour publier l\'annonce (1 crédit).',
        category: 'Vendre',
      },
      {
        question: 'Comment rechercher des articles ?',
        answer: 'Utilisez la barre de recherche sur l\'écran d\'accueil. Tapez le nom de l\'article, la marque ou la catégorie. Vous pouvez aussi utiliser les filtres pour affiner votre recherche.',
        category: 'Acheter',
      },
      {
        question: 'Comment filtrer par localisation ?',
        answer: 'Appuyez sur le bouton de localisation en haut de l\'écran d\'accueil. Sélectionnez votre ville et ajustez le rayon de recherche pour voir les articles près de vous.',
        category: 'Acheter',
      },
      {
        question: 'Que faire si je ne reçois pas de notifications ?',
        answer: 'Vérifiez que les notifications sont activées dans les paramètres de votre appareil et dans les paramètres de l\'application. Assurez-vous aussi d\'avoir une connexion Internet stable.',
        category: 'Technique',
      },
      {
        question: 'Comment sauvegarder des articles en favoris ?',
        answer: 'Appuyez sur l\'icône cœur sur n\'importe quelle annonce pour la sauvegarder dans vos favoris. Vous serez notifié si le prix baisse.',
        category: 'Acheter',
      },
      {
        question: 'Quels sont les conseils de sécurité ?',
        answer: 'Rencontrez toujours dans des lieux publics, ne partagez jamais vos informations bancaires, inspectez l\'article avant de payer, et faites confiance à votre instinct.',
        category: 'Sécurité',
      },
    ],
    en: [
      {
        question: 'How do I post a listing?',
        answer: 'To post a listing, go to the "Post" tab, fill in the information (title, description, price, photos), select a category and click "Publish". Each listing costs 1 credit.',
        category: 'Selling',
      },
      {
        question: 'How do I buy credits?',
        answer: 'Go to your profile, "Buy Credits" section. Choose a pack and contact us via WhatsApp to finalize the purchase. Your credits will be added immediately after payment.',
        category: 'Account',
      },
      {
        question: 'How do I contact a seller?',
        answer: 'On a listing page, click the message button to start a conversation with the seller. You can chat directly in the app.',
        category: 'Buying',
      },
      {
        question: 'How do I mark a listing as sold?',
        answer: 'In your profile, find the listing and click "Mark Sold". The listing will be marked as sold but remain visible in your history.',
        category: 'Selling',
      },
      {
        question: 'How do I edit my profile?',
        answer: 'Go to Profile > Edit Profile. You can change your photo, name, WhatsApp number and city.',
        category: 'Account',
      },
      {
        question: 'Do listings expire?',
        answer: 'No, your listings remain active until you mark them as sold or delete them.',
        category: 'Selling',
      },
      {
        question: 'How do I report a suspicious listing?',
        answer: 'Contact our support via WhatsApp with the listing link. We will review and take appropriate action.',
        category: 'Safety',
      },
      {
        question: 'Can I edit a listing after publishing?',
        answer: 'Yes, in your profile, click the edit icon on your listing to modify it.',
        category: 'Selling',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Go to Settings > Danger Zone > Delete Account. This action is irreversible.',
        category: 'Account',
      },
      {
        question: 'Does Marché.cd take a commission?',
        answer: 'No, we don\'t take any commission on your sales. You only pay to publish the listing (1 credit).',
        category: 'Selling',
      },
      {
        question: 'How do I search for items?',
        answer: 'Use the search bar on the home screen. Type the item name, brand, or category. You can also use filters to refine your search.',
        category: 'Buying',
      },
      {
        question: 'How do I filter by location?',
        answer: 'Tap the location button at the top of the home screen. Select your city and adjust the search radius to see items near you.',
        category: 'Buying',
      },
      {
        question: 'What if I\'m not receiving notifications?',
        answer: 'Check that notifications are enabled in your device settings and in the app settings. Also ensure you have a stable internet connection.',
        category: 'Technical',
      },
      {
        question: 'How do I save items to favorites?',
        answer: 'Tap the heart icon on any listing to save it to your favorites. You\'ll be notified if the price drops.',
        category: 'Buying',
      },
      {
        question: 'What are the safety tips?',
        answer: 'Always meet in public places, never share your banking information, inspect the item before paying, and trust your instincts.',
        category: 'Safety',
      },
    ],
  };

  const faqs = faqsData[language];

  // Filter FAQs based on search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqs;
    }

    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query)
    );
  }, [searchQuery, faqs]);

  // Group FAQs by category
  const groupedFaqs = useMemo(() => {
    const groups: Record<string, typeof faqs> = {};
    filteredFaqs.forEach((faq) => {
      if (!groups[faq.category]) {
        groups[faq.category] = [];
      }
      groups[faq.category].push(faq);
    });
    return groups;
  }, [filteredFaqs]);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setExpandedIndex(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'fr' ? "Centre d'aide" : 'Help Center'}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={styles.introTitle}>
              {language === 'fr' ? 'Questions fréquentes' : 'Frequently Asked Questions'}
            </Text>
            <Text style={styles.introText}>
              {language === 'fr'
                ? 'Trouvez rapidement des réponses à vos questions'
                : 'Find quick answers to your questions'}
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder={
                  language === 'fr' ? 'Rechercher dans l\'aide...' : 'Search help...'
                }
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <X size={18} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* No Results Message */}
          {filteredFaqs.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>
                {language === 'fr'
                  ? 'Aucun résultat trouvé'
                  : 'No results found'}
              </Text>
              <Text style={styles.noResultsSubtext}>
                {language === 'fr'
                  ? 'Essayez d\'autres mots-clés ou contactez le support'
                  : 'Try different keywords or contact support'}
              </Text>
            </View>
          )}

          {/* Grouped FAQs */}
          {Object.keys(groupedFaqs).map((category) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {groupedFaqs[category].map((faq, index) => {
                const globalIndex = filteredFaqs.indexOf(faq);
                return (
                  <View key={globalIndex} style={styles.faqItem}>
                    <TouchableOpacity
                      style={styles.faqQuestion}
                      onPress={() => toggleFAQ(globalIndex)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.faqQuestionText}>{faq.question}</Text>
                      {expandedIndex === globalIndex ? (
                        <ChevronUp size={20} color={Colors.primary} />
                      ) : (
                        <ChevronDown size={20} color="#64748b" />
                      )}
                    </TouchableOpacity>

                    {expandedIndex === globalIndex && (
                      <View style={styles.faqAnswer}>
                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>
              {language === 'fr' ? 'Besoin d\'aide supplémentaire ?' : 'Need more help?'}
            </Text>
            <Text style={styles.contactText}>
              {language === 'fr'
                ? 'Notre équipe est disponible pour vous aider'
                : 'Our team is available to help you'}
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => router.back()}
            >
              <Text style={styles.contactButtonText}>
                {language === 'fr' ? 'Contacter le support' : 'Contact Support'}
              </Text>
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
    marginBottom: 8,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'solid' as const } as any) : {}),
  },
  clearButton: {
    padding: 4,
  },
  noResults: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    backgroundColor: Colors.primary,
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
