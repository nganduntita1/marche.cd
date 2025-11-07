import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Linking,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, MessageCircle, Calendar, Tag, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { ListingWithDetails } from '@/types/database';

const { width } = Dimensions.get('window');
import { useAuth } from '@/contexts/AuthContext';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<ListingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showSafetyGuide, setShowSafetyGuide] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (id) {
      loadListing();
    }
  }, [id]);

  const loadListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          seller:seller_id(*),
          category:category_id(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      router.back();
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const openWhatsApp = () => {
    if (!listing?.seller.phone) return;

    const phone = listing.seller.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Bonjour! Je suis intéressé par votre annonce "${listing.title}" sur Marché.cd`
    );
    const url = `https://wa.me/${phone}?text=${message}`;

    Linking.openURL(url).catch(err =>
      console.error('Error opening WhatsApp:', err)
    );
  };

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const images = listing?.images || [];
    if (direction === 'prev') {
      setModalImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
    } else {
      setModalImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
    }
  };

  const navigateMainGallery = (direction: 'prev' | 'next') => {
    const images = listing?.images || [];
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = activeImageIndex > 0 ? activeImageIndex - 1 : images.length - 1;
    } else {
      newIndex = activeImageIndex < images.length - 1 ? activeImageIndex + 1 : 0;
    }
    
    setActiveImageIndex(newIndex);
    scrollViewRef.current?.scrollTo({
      x: newIndex * width,
      animated: true,
    });
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      new: 'Neuf',
      like_new: 'Comme neuf',
      good: 'Bon état',
      fair: 'État correct',
      poor: 'À réparer',
    };
    return labels[condition] || condition;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9bbd1f" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Annonce introuvable</Text>
          <Text style={styles.errorText}>Cette annonce n'existe plus ou a été supprimée.</Text>
          <TouchableOpacity
            style={styles.errorBackButton}
            onPress={() => router.back()}
          >
            <Text style={styles.errorBackButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images = listing.images?.length > 0
    ? listing.images
    : ['https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=800'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={event => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((imageUrl, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => openImageModal(index)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.image}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#1e293b" />
          </TouchableOpacity>

          {images.length > 1 && (
            <>
              <TouchableOpacity
                style={styles.navButtonLeft}
                onPress={() => navigateMainGallery('prev')}
              >
                <ChevronLeft size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navButtonRight}
                onPress={() => navigateMainGallery('next')}
              >
                <ChevronRight size={24} color="#fff" />
              </TouchableOpacity>

              <View style={styles.imageIndicator}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === activeImageIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>${listing.price}</Text>
          </View>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#64748b" />
              <Text style={styles.metaText}>{listing.location}</Text>
            </View>
            {listing.category && (
              <View style={styles.metaItem}>
                <Tag size={16} color="#64748b" />
                <Text style={styles.metaText}>{listing.category.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.separator} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>État</Text>
              <Text style={styles.detailValue}>
                {getConditionLabel(listing.condition)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#64748b" />
              <Text style={styles.detailLabel}>Publié le</Text>
              <Text style={styles.detailValue}>
                {formatDate(listing.created_at)}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vendeur</Text>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerInitial}>
                  {listing.seller.name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{listing.seller.name || 'Utilisateur'}</Text>
                <View style={styles.sellerLocation}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={styles.sellerLocationText}>
                    {listing.seller.location || listing.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.safetyButton}
              onPress={() => setShowSafetyGuide(!showSafetyGuide)}
            >
              <Text style={styles.safetyButtonText}>🛡️ Conseils de sécurité</Text>
              <Text style={styles.safetyButtonIcon}>
                {showSafetyGuide ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showSafetyGuide && (
              <View style={styles.safetyGuide}>
                <ScrollView style={styles.safetyContent} nestedScrollEnabled={true}>
                  <Text style={styles.safetyTitle}>
                    🛡️ Guide de Sécurité — Évitez les Arnaques sur Marché.cd
                  </Text>
                  <Text style={styles.safetyIntro}>
                    Chez Marché.cd, nous voulons que chaque utilisateur achète et vende en toute confiance. Voici quelques conseils importants pour vous protéger contre les arnaques et les mauvaises expériences.
                  </Text>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>⚠️ 1. Ne payez jamais avant d'avoir vu le produit</Text>
                    <Text style={styles.safetyTipText}>• Ne versez aucun acompte avant d'avoir rencontré le vendeur.</Text>
                    <Text style={styles.safetyTipText}>• Vérifiez le produit en personne avant de payer.</Text>
                    <Text style={styles.safetyTipText}>• Si possible, rencontrez-vous dans un lieu public et sûr (ex. centre commercial, station-service).</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>🧾 2. Méfiez-vous des prix trop bas</Text>
                    <Text style={styles.safetyTipText}>• Si le prix est trop beau pour être vrai, il y a probablement un problème.</Text>
                    <Text style={styles.safetyTipText}>• Comparez les prix d'autres annonces similaires avant de décider.</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>💬 3. Communiquez toujours via WhatsApp</Text>
                    <Text style={styles.safetyTipText}>• Évitez de partager vos informations personnelles (carte d'identité, numéro de compte, etc.).</Text>
                    <Text style={styles.safetyTipText}>• Si quelqu'un refuse de parler sur WhatsApp ou d'envoyer des photos réelles, soyez prudent.</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>👤 4. Vérifiez le profil du vendeur</Text>
                    <Text style={styles.safetyTipText}>• Regardez depuis combien de temps il est sur la plateforme.</Text>
                    <Text style={styles.safetyTipText}>• Les vendeurs actifs et avec plusieurs annonces récentes sont généralement plus fiables.</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>💰 5. Utilisez les paiements sécurisés</Text>
                    <Text style={styles.safetyTipText}>• Ne transférez jamais d'argent avant d'avoir reçu le produit.</Text>
                    <Text style={styles.safetyTipText}>• Privilégiez le paiement en main propre ou via un service de paiement sécurisé.</Text>
                    <Text style={styles.safetyTipText}>• Évitez les paiements à distance à des inconnus.</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>🕵️ 6. Signalez les comportements suspects</Text>
                    <Text style={styles.safetyTipText}>• Si un vendeur vous semble louche, signalez-le immédiatement à notre équipe via l'application.</Text>
                    <Text style={styles.safetyTipText}>• Nous supprimons rapidement les annonces et comptes frauduleux.</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>📵 7. Ne partagez pas d'informations sensibles</Text>
                    <Text style={styles.safetyTipText}>• Ne donnez jamais vos codes OTP, mots de passe ou informations bancaires à qui que ce soit.</Text>
                    <Text style={styles.safetyTipText}>• Marché.cd ne vous demandera jamais ces informations.</Text>
                  </View>

                  <View style={styles.safetyDisclaimer}>
                    <Text style={styles.safetyDisclaimerTitle}>⚖️ Responsabilité</Text>
                    <Text style={styles.safetyDisclaimerText}>
                      Marché.cd met tout en œuvre pour offrir une plateforme sûre, mais chaque utilisateur reste responsable de ses transactions. Nous ne sommes pas responsables des pertes financières, arnaques ou litiges résultant du non-respect de ces conseils de sécurité.
                    </Text>
                  </View>

                  <View style={styles.safetySummary}>
                    <Text style={styles.safetySummaryTitle}>💚 En résumé</Text>
                    <Text style={styles.safetySummaryText}>
                      Restez vigilant, vérifiez toujours avant de payer, et privilégiez la rencontre en personne. Ensemble, faisons de Marché.cd un espace sûr et de confiance pour tous les Congolais 🇨🇩.
                    </Text>
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <MessageCircle size={20} color="#fff" />
          <Text style={styles.whatsappButtonText}>Contacter sur WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowImageModal(false)}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: modalImageIndex * width, y: 0 }}
            onScroll={event => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setModalImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((imageUrl, index) => (
              <View key={index} style={styles.modalImageContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {images.length > 1 && (
            <>
              <TouchableOpacity
                style={styles.modalNavLeft}
                onPress={() => navigateImage('prev')}
              >
                <ChevronLeft size={32} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalNavRight}
                onPress={() => navigateImage('next')}
              >
                <ChevronRight size={32} color="#fff" />
              </TouchableOpacity>

              <View style={styles.modalIndicator}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.modalDot,
                      index === modalImageIndex && styles.modalDotActive,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorBackButton: {
    backgroundColor: '#9bbd1f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width,
    height: 280,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 30,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#9bbd1f',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9bbd1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  sellerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerLocationText: {
    fontSize: 14,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width - 40,
    height: '80%',
  },
  modalNavLeft: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalNavRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIndicator: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  modalDotActive: {
    backgroundColor: '#fff',
  },

  // Safety guide styles
  safetyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  safetyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  safetyButtonIcon: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  safetyGuide: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 400,
  },
  safetyContent: {
    padding: 16,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 24,
  },
  safetyIntro: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  safetyTip: {
    marginBottom: 20,
  },
  safetyTipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 20,
  },
  safetyTipText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 4,
    paddingLeft: 8,
  },
  safetyDisclaimer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  safetyDisclaimerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 6,
  },
  safetyDisclaimerText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  safetySummary: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  safetySummaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 6,
  },
  safetySummaryText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
});
