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
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, MessageCircle, Calendar, ChevronLeft, ChevronRight, X, Heart, Star, ThumbsUp, DollarSign, Share2, Sparkles } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { ListingWithDetails } from '@/types/database';

const { width } = Dimensions.get('window');
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useGuidance } from '@/contexts/GuidanceContext';
import { calculateDistance, formatDistance } from '@/services/locationService';
import Colors from '@/constants/Colors';
import SafetyTipsModal from '@/components/SafetyTipsModal';
import ShareModal from '@/components/ShareModal';
import PromoteModal from '@/components/PromoteModal';
import SelectBuyerModal from '@/components/SelectBuyerModal';
import { Tooltip } from '@/components/guidance/Tooltip';
import { ContextualPrompt } from '@/components/guidance/ContextualPrompt';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const { userLocation } = useLocation();
  const guidance = useGuidance();
  const isFrench = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().startsWith('fr');
  const txt = (fr: string, en: string) => (isFrench ? fr : en);
  const [listing, setListing] = useState<ListingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showSafetyGuide, setShowSafetyGuide] = useState(false);
  const [showSafetyTipsModal, setShowSafetyTipsModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [showCustomMessageModal, setShowCustomMessageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showSelectBuyerModal, setShowSelectBuyerModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Guidance state
  const [showContactTooltip, setShowContactTooltip] = useState(false);
  const [showImageSwipeHint, setShowImageSwipeHint] = useState(false);
  const [showQuickActionsPrompt, setShowQuickActionsPrompt] = useState(false);
  const [showFavoriteConfirmation, setShowFavoriteConfirmation] = useState(false);
  const [showSellerProfileTooltip, setShowSellerProfileTooltip] = useState(false);
  const [idleTimer, setIdleTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const messageButtonRef = useRef<View>(null);
  const favoriteButtonRef = useRef<View>(null);
  const sellerCardRef = useRef<View>(null);

  useEffect(() => {
    if (id) {
      loadListing();
      checkFavoriteStatus();
      
      // Track screen view for guidance
      guidance.incrementScreenView('listing_detail');
      
      // Show guidance on first visit
      const isFirstVisit = !guidance.state.features.hasViewedFirstListing;
      if (isFirstVisit) {
        // Mark as viewed
        guidance.markActionCompleted('first_listing_view');
        
        // Show contact seller tooltip after a short delay
        setTimeout(() => {
          if (guidance.shouldShowTooltip('listing_contact_seller')) {
            setShowContactTooltip(true);
          }
        }, 1000);
        
        // Show image swipe hint if multiple images
        setTimeout(() => {
          if (guidance.shouldShowTooltip('listing_image_swipe')) {
            setShowImageSwipeHint(true);
          }
        }, 3000);
      }
      
      // Set up idle timer for Quick Actions (5 seconds of inactivity)
      const timer = setTimeout(() => {
        if (guidance.shouldShowPrompt('listing_quick_actions')) {
          setShowQuickActionsPrompt(true);
        }
      }, 5000);
      
      setIdleTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [id]);

  const checkFavoriteStatus = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .maybeSingle();

      if (!error && data) {
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setFavoriteLoading(true);

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', id);

        if (!error) {
          setIsFavorite(false);
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: id,
          });

        if (!error) {
          setIsFavorite(true);
          
          // Show confirmation on first favorite
          if (guidance.shouldShowTooltip('listing_favorite_confirmation')) {
            setShowFavoriteConfirmation(true);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

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
    return `$${price.toLocaleString('en-US')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isFrench ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const openWhatsApp = () => {
    if (!listing?.seller.phone) return;

    const phone = listing.seller.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      txt(
        `Bonjour! Je suis intéressé par votre annonce "${listing.title}" sur Marché.cd`,
        `Hi! I'm interested in your listing "${listing.title}" on Marché.cd`
      )
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
      new: txt('Neuf', 'New'),
      like_new: txt('Comme neuf', 'Like new'),
      good: txt('Bon état', 'Good'),
      fair: txt('État correct', 'Fair'),
      poor: txt('À réparer', 'Needs repair'),
    };
    return labels[condition] || condition;
  };

  const handleQuickMessage = async (messageText: string) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Check if conversation exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing?.id)
      .eq('buyer_id', user.id)
      .maybeSingle();

    // Show safety tips for first-time conversations
    if (!existingConv) {
      setPendingMessage(messageText); // Store the message
      setShowSafetyTipsModal(true);
      return;
    }

    // If conversation exists, send message and navigate
    await sendQuickMessage(existingConv.id, messageText);
    router.push(`/chat/${existingConv.id}`);
  };

  const sendQuickMessage = async (conversationId: string, messageText: string) => {
    try {
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user?.id,
          content: messageText,
        });
    } catch (error) {
      console.error('Error sending quick message:', error);
    }
  };

  const proceedToChat = async (initialMessage?: string) => {
    setShowSafetyTipsModal(false);
    
    try {
      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing?.id,
          buyer_id: user?.id,
          seller_id: listing?.seller_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Send initial message if provided
      if (initialMessage) {
        await sendQuickMessage(newConv.id, initialMessage);
      }

      router.push(`/chat/${newConv.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert(txt('Erreur', 'Error'), txt('Impossible de créer la conversation', 'Unable to create the conversation'));
    }
  };

  const handleIsAvailable = () => {
    const message = txt(
      `Bonjour! Est-ce que "${listing?.title}" est toujours disponible?`,
      `Hi! Is "${listing?.title}" still available?`
    );
    handleQuickMessage(message);
  };

  const handleMakeOffer = () => {
    setShowOfferModal(true);
  };

  const submitOffer = () => {
    if (!offerAmount.trim()) {
      Alert.alert(txt('Erreur', 'Error'), txt('Veuillez entrer un montant', 'Please enter an amount'));
      return;
    }

    const amount = parseFloat(offerAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(txt('Erreur', 'Error'), txt('Montant invalide', 'Invalid amount'));
      return;
    }

    const message = txt(
      `Bonjour! Je suis intéressé par "${listing?.title}". Seriez-vous d'accord pour ${formatPrice(amount)}?`,
      `Hi! I'm interested in "${listing?.title}". Would you accept ${formatPrice(amount)}?`
    );
    setShowOfferModal(false);
    setOfferAmount('');
    handleQuickMessage(message);
  };

  const handleCustomMessage = () => {
    setShowCustomMessageModal(true);
  };

  const submitCustomMessage = () => {
    if (!customMessage.trim()) {
      Alert.alert(txt('Erreur', 'Error'), txt('Veuillez entrer un message', 'Please enter a message'));
      return;
    }

    setShowCustomMessageModal(false);
    const message = customMessage;
    setCustomMessage('');
    handleQuickMessage(message);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{txt('Chargement...', 'Loading...')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{txt('Annonce introuvable', 'Listing not found')}</Text>
          <Text style={styles.errorText}>{txt("Cette annonce n'existe plus ou a été supprimée.", 'This listing no longer exists or was deleted.')}</Text>
          <TouchableOpacity
            style={styles.errorBackButton}
            onPress={() => router.back()}
          >
            <Text style={styles.errorBackButtonText}>{txt('Retour', 'Back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images = listing.images?.length > 0
    ? listing.images
    : ['https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=800'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {/* Main Image Display */}
          <TouchableOpacity
            onPress={() => openImageModal(activeImageIndex)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: images[activeImageIndex] }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#1e293b" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => setShowShareModal(true)}
          >
            <Share2 size={20} color="#1e293b" />
          </TouchableOpacity>

          {/* Image Counter Badge */}
          {images.length > 1 && (
            <View style={styles.imageCountBadge}>
              <Text style={styles.imageCountText}>
                {activeImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <View style={styles.thumbnailContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailScrollContent}
              >
                {images.map((imageUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setActiveImageIndex(index)}
                    style={[
                      styles.thumbnailWrapper,
                      index === activeImageIndex && styles.thumbnailWrapperActive,
                    ]}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                    {index === activeImageIndex && (
                      <View style={styles.thumbnailOverlay} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Breadcrumb */}
          {listing.category && (
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>{txt('Électronique', 'Electronics')}</Text>
              <Text style={styles.breadcrumbSeparator}>/</Text>
              <Text style={styles.breadcrumbText}>{txt('Audio et Vidéo', 'Audio & Video')}</Text>
              <Text style={styles.breadcrumbSeparator}>/</Text>
              <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>
                {listing.category.name}
              </Text>
            </View>
          )}

          <View style={styles.header}>
            <Text style={styles.title}>{listing.title}</Text>
            {user?.id === listing.seller_id ? (
              // Owner: Show mark as sold button
              listing.status === 'active' && (
                <TouchableOpacity
                  style={styles.headerMarkSoldButton}
                  onPress={() => setShowSelectBuyerModal(true)}
                >
                  <Text style={styles.headerMarkSoldButtonText}>{txt('Marquer vendu', 'Mark sold')}</Text>
                </TouchableOpacity>
              )
            ) : (
              // Buyer: Show favorite button
              <TouchableOpacity
                ref={favoriteButtonRef}
                style={styles.headerFavoriteButton}
                onPress={toggleFavorite}
                disabled={favoriteLoading}
              >
                <Heart
                  size={28}
                  color={isFavorite ? '#ef4444' : '#1e293b'}
                  fill={isFavorite ? '#ef4444' : 'transparent'}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Rating and Recommendation */}
          <View style={styles.ratingSection}>
            <View style={styles.ratingItem}>
              <Star size={18} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingText}>4.6</Text>
              <Text style={styles.reviewsText}>{txt('120 Avis', '120 Reviews')}</Text>
            </View>
            <View style={styles.ratingItem}>
              <ThumbsUp size={18} color={Colors.primary} />
              <Text style={styles.recommendText}>86%</Text>
              <Text style={styles.recommendSubtext}>{txt('(102) recommandent', '(102) recommend')}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{txt('Description', 'Description')}</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{txt('Détails', 'Details')}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{txt('État', 'Condition')}</Text>
              <Text style={styles.detailValue}>
                {getConditionLabel(listing.condition)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#64748b" />
              <Text style={styles.detailLabel}>{txt('Publié le', 'Posted on')}</Text>
              <Text style={styles.detailValue}>
                {formatDate(listing.created_at)}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{txt('Localisation', 'Location')}</Text>
            
            <View style={styles.locationInfo}>
              <View style={styles.locationRow}>
                <MapPin size={20} color={Colors.primary} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationCity}>{listing.location}</Text>
                  {userLocation && listing.latitude && listing.longitude && (
                    <Text style={styles.locationDistance}>
                      {txt('À', '')} {formatDistance(calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        listing.latitude,
                        listing.longitude
                      ))} {txt('de vous', 'away from you')}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Map View - Web-friendly embedded map */}
            {listing.latitude && listing.longitude && (
              <View style={styles.mapContainer}>
                {Platform.OS === 'web' ? (
                  // Web: Use embedded Google Maps iframe
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: 16 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${listing.latitude},${listing.longitude}&zoom=14&maptype=roadmap`}
                  />
                ) : (
                  // Mobile: Show static map image or simple placeholder
                  <Image
                    source={{
                      uri: `https://maps.googleapis.com/maps/api/staticmap?center=${listing.latitude},${listing.longitude}&zoom=14&size=600x300&markers=color:green%7C${listing.latitude},${listing.longitude}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`
                    }}
                    style={styles.map}
                    resizeMode="cover"
                  />
                )}
                
                {/* Green circle overlay to show approximate area */}
                <View style={styles.circleOverlay}>
                  <View style={styles.greenCircle} />
                </View>
                
                <View style={styles.mapOverlay}>
                  <Text style={styles.mapOverlayText}>
                    {txt('📍 Zone approximative pour votre sécurité', '📍 Approximate area for your safety')}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.separator} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{txt('Vendeur', 'Seller')}</Text>
            <View ref={sellerCardRef} style={styles.sellerCard}>
              <TouchableOpacity 
                style={styles.sellerInfo}
                onPress={() => {
                  router.push(`/user/${listing.seller_id}`);
                  // Show seller profile tooltip on first view
                  if (guidance.shouldShowTooltip('listing_seller_profile')) {
                    setShowSellerProfileTooltip(true);
                  }
                }}
                activeOpacity={0.7}
              >
                {listing.seller.profile_picture ? (
                  <Image 
                    source={{ uri: listing.seller.profile_picture }} 
                    style={styles.sellerAvatarImage}
                  />
                ) : (
                  <View style={styles.sellerAvatar}>
                    <Text style={styles.sellerInitial}>
                      {listing.seller.name?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.sellerDetails}>
                  <View style={styles.sellerNameRow}>
                    <Text style={styles.sellerName}>{listing.seller.name || 'Utilisateur'}</Text>
                    {/* Mock verified badge - will be real data later */}
                    {Math.random() > 0.4 && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.sellerLocation}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.sellerLocationText}>
                      {listing.seller.location || listing.location}
                    </Text>
                  </View>
                  <View style={styles.sellerStats}>
                    <View style={styles.sellerStat}>
                      <Text style={styles.sellerStatValue}>4.8</Text>
                      <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    </View>
                    <View style={styles.sellerStatDivider} />
                    <View style={styles.sellerStat}>
                      <Text style={styles.sellerStatLabel}>{txt('24 ventes', '24 sales')}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.viewProfileButton}
                onPress={() => router.push(`/user/${listing.seller_id}`)}
              >
                <Text style={styles.viewProfileButtonText}>{txt('Voir profil', 'View profile')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.safetyButton}
              onPress={() => setShowSafetyGuide(!showSafetyGuide)}
            >
              <Text style={styles.safetyButtonText}>{txt('🛡️ Conseils de sécurité', '🛡️ Safety tips')}</Text>
              <Text style={styles.safetyButtonIcon}>
                {showSafetyGuide ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showSafetyGuide && (
              <View style={styles.safetyGuide}>
                <ScrollView style={styles.safetyContent} nestedScrollEnabled={true}>
                  <Text style={styles.safetyTitle}>
                    {txt('🛡️ Guide de Sécurité — Évitez les Arnaques sur Marché.cd', '🛡️ Safety Guide — Avoid Scams on Marché.cd')}
                  </Text>
                  <Text style={styles.safetyIntro}>
                    {txt('Chez Marché.cd, nous voulons que chaque utilisateur achète et vende en toute confiance. Voici quelques conseils importants pour vous protéger contre les arnaques et les mauvaises expériences.', 'At Marché.cd, we want every user to buy and sell with confidence. Here are key tips to protect you from scams and bad experiences.')}
                  </Text>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>{txt("⚠️ 1. Ne payez jamais avant d'avoir vu le produit", '⚠️ 1. Never pay before seeing the product')}</Text>
                    <Text style={styles.safetyTipText}>{txt("• Ne versez aucun acompte avant d'avoir rencontré le vendeur.", '• Do not pay any deposit before meeting the seller.')}</Text>
                    <Text style={styles.safetyTipText}>{txt('• Vérifiez le produit en personne avant de payer.', '• Check the product in person before paying.')}</Text>
                    <Text style={styles.safetyTipText}>{txt('• Si possible, rencontrez-vous dans un lieu public et sûr (ex. centre commercial, station-service).', '• If possible, meet in a safe public place (e.g., mall, gas station).')}</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>{txt('🧾 2. Méfiez-vous des prix trop bas', '🧾 2. Be careful with very low prices')}</Text>
                    <Text style={styles.safetyTipText}>{txt('• Si le prix est trop beau pour être vrai, il y a probablement un problème.', '• If the price is too good to be true, there is likely a problem.')}</Text>
                    <Text style={styles.safetyTipText}>{txt("• Comparez les prix d'autres annonces similaires avant de décider.", '• Compare prices from similar listings before deciding.')}</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>{txt('💬 3. Communiquez toujours via WhatsApp', '💬 3. Communicate via WhatsApp')}</Text>
                    <Text style={styles.safetyTipText}>{txt("• Évitez de partager vos informations personnelles (carte d'identité, numéro de compte, etc.).", '• Avoid sharing personal information (ID card, bank details, etc.).')}</Text>
                    <Text style={styles.safetyTipText}>{txt("• Si quelqu'un refuse de parler sur WhatsApp ou d'envoyer des photos réelles, soyez prudent.", '• If someone refuses WhatsApp or real photos, be careful.')}</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>{txt('👤 4. Vérifiez le profil du vendeur', '👤 4. Check the seller profile')}</Text>
                    <Text style={styles.safetyTipText}>{txt('• Regardez depuis combien de temps il est sur la plateforme.', '• Check how long they have been on the platform.')}</Text>
                    <Text style={styles.safetyTipText}>{txt('• Les vendeurs actifs et avec plusieurs annonces récentes sont généralement plus fiables.', '• Active sellers with recent listings are generally more reliable.')}</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>{txt('💰 5. Utilisez les paiements sécurisés', '💰 5. Use secure payments')}</Text>
                    <Text style={styles.safetyTipText}>{txt("• Ne transférez jamais d'argent avant d'avoir reçu le produit.", '• Never transfer money before receiving the product.')}</Text>
                    <Text style={styles.safetyTipText}>{txt('• Privilégiez le paiement en main propre ou via un service de paiement sécurisé.', '• Prefer in-person payment or a secure payment service.')}</Text>
                    <Text style={styles.safetyTipText}>{txt('• Évitez les paiements à distance à des inconnus.', '• Avoid remote payments to strangers.')}</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>{txt('🕵️ 6. Signalez les comportements suspects', '🕵️ 6. Report suspicious behavior')}</Text>
                    <Text style={styles.safetyTipText}>{txt("• Si un vendeur vous semble louche, signalez-le immédiatement à notre équipe via l'application.", '• If a seller seems suspicious, report them to our team immediately in the app.')}</Text>
                    <Text style={styles.safetyTipText}>{txt('• Nous supprimons rapidement les annonces et comptes frauduleux.', '• We quickly remove fraudulent listings and accounts.')}</Text>
                  </View>

                  <View style={styles.safetyTip}>
                    <Text style={styles.safetyTipTitle}>{txt("📵 7. Ne partagez pas d'informations sensibles", '📵 7. Do not share sensitive information')}</Text>
                    <Text style={styles.safetyTipText}>{txt('• Ne donnez jamais vos codes OTP, mots de passe ou informations bancaires à qui que ce soit.', '• Never share OTP codes, passwords, or banking information with anyone.')}</Text>
                    <Text style={styles.safetyTipText}>{txt('• Marché.cd ne vous demandera jamais ces informations.', '• Marché.cd will never ask for this information.')}</Text>
                  </View>

                  <View style={styles.safetyDisclaimer}>
                    <Text style={styles.safetyDisclaimerTitle}>{txt('⚖️ Responsabilité', '⚖️ Responsibility')}</Text>
                    <Text style={styles.safetyDisclaimerText}>
                      {txt('Marché.cd met tout en œuvre pour offrir une plateforme sûre, mais chaque utilisateur reste responsable de ses transactions. Nous ne sommes pas responsables des pertes financières, arnaques ou litiges résultant du non-respect de ces conseils de sécurité.', 'Marché.cd does its best to provide a safe platform, but each user remains responsible for their transactions. We are not responsible for financial losses, scams, or disputes resulting from not following these safety tips.')}
                    </Text>
                  </View>

                  <View style={styles.safetySummary}>
                    <Text style={styles.safetySummaryTitle}>{txt('💚 En résumé', '💚 In summary')}</Text>
                    <Text style={styles.safetySummaryText}>
                      {txt('Restez vigilant, vérifiez toujours avant de payer, et privilégiez la rencontre en personne. Ensemble, faisons de Marché.cd un espace sûr et de confiance pour tous les Congolais 🇨🇩.', 'Stay alert, always verify before paying, and prefer meeting in person. Together, let’s keep Marché.cd safe and trusted for everyone 🇨🇩.')}
                    </Text>
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {user?.id === listing.seller_id ? (
        // Owner actions
        <>
          <View style={styles.ownerQuickActions}>
            {!listing.is_promoted && listing.status === 'active' && (
              <TouchableOpacity 
                style={styles.promoteButtonQuick}
                onPress={() => setShowPromoteModal(true)}
              >
                <Sparkles size={18} color="#fff" />
                <Text style={styles.promoteButtonQuickText}>{txt('Promouvoir', 'Promote')}</Text>
              </TouchableOpacity>
            )}
            {listing.is_promoted && (
              <View style={styles.promotedIndicator}>
                <Sparkles size={16} color="#fbbf24" />
                <Text style={styles.promotedIndicatorText}>{txt('Annonce promue', 'Promoted listing')}</Text>
              </View>
            )}
          </View>
          <View style={styles.footer}>
            <View style={styles.priceSection}>
              <Text style={styles.footerPrice}>${listing.price.toLocaleString('en-US')}</Text>
              <Text style={styles.deliveryText}>{txt('Votre annonce', 'Your listing')}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.editButtonFooter} 
              onPress={() => router.push(`/edit-listing/${id}`)}
            >
              <Text style={styles.editButtonText}>{txt("Modifier l'annonce", 'Edit listing')}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // Buyer actions
        <>
          {/* Quick Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleIsAvailable}
            >
              <MessageCircle size={18} color={Colors.primary} />
              <Text style={styles.quickActionText}>{txt('Est-ce disponible?', 'Is this available?')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleMakeOffer}
            >
              <DollarSign size={18} color={Colors.primary} />
              <Text style={styles.quickActionText}>{txt('Faire une offre', 'Make an offer')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleCustomMessage}
            >
              <MessageCircle size={18} color={Colors.primary} />
              <Text style={styles.quickActionText}>{txt('Message personnalisé', 'Custom message')}</Text>
            </TouchableOpacity>
          </View>

          {/* Footer with price and message button */}
          <View style={styles.footer}>
            <View style={styles.priceSection}>
              <Text style={styles.footerPrice}>{formatPrice(listing.price)}</Text>
              <Text style={styles.deliveryText}>{txt('Livraison disponible', 'Delivery available')}</Text>
            </View>
            
            <TouchableOpacity 
              ref={messageButtonRef}
              style={styles.messageButton} 
              onPress={() => {
                const greeting = txt(
                  `Bonjour! Je suis intéressé par "${listing.title}" et j'aimerais l'acheter.`,
                  `Hi! I'm interested in "${listing.title}" and I'd like to buy it.`
                );
                handleQuickMessage(greeting);
                // Reset idle timer on interaction
                if (idleTimer) clearTimeout(idleTimer);
              }}
            >
              <MessageCircle size={24} color="#fff" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

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

          {/* Single Image Display */}
          <View style={styles.modalImageContainer}>
            <Image
              source={{ uri: images[modalImageIndex] }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>

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
                <Text style={styles.modalCounterText}>
                  {modalImageIndex + 1} / {images.length}
                </Text>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Offer Modal */}
      <Modal
        visible={showOfferModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOfferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.offerModalContainer}>
            <View style={styles.offerModalHeader}>
              <Text style={styles.offerModalTitle}>{txt('Faire une offre', 'Make an offer')}</Text>
              <TouchableOpacity onPress={() => setShowOfferModal(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.offerModalSubtitle}>
              {txt('Asking price', 'Asking price')}: {formatPrice(listing?.price || 0)}
            </Text>
            
            <View style={styles.offerInputContainer}>
              <Text style={styles.offerInputLabel}>{txt('Votre offre (USD)', 'Your offer (USD)')}</Text>
              <TextInput
                style={styles.offerInput}
                placeholder={txt('Entrez votre offre', 'Enter your offer')}
                keyboardType="numeric"
                value={offerAmount}
                onChangeText={setOfferAmount}
                autoFocus
              />
            </View>
            
            <View style={styles.offerModalButtons}>
              <TouchableOpacity 
                style={styles.offerCancelButton}
                onPress={() => {
                  setShowOfferModal(false);
                  setOfferAmount('');
                }}
              >
                <Text style={styles.offerCancelButtonText}>{txt('Annuler', 'Cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.offerSubmitButton}
                onPress={submitOffer}
              >
                <Text style={styles.offerSubmitButtonText}>{txt("Envoyer l'offre", 'Send offer')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Message Modal */}
      <Modal
        visible={showCustomMessageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.offerModalContainer}>
            <View style={styles.offerModalHeader}>
              <Text style={styles.offerModalTitle}>{txt('Message personnalisé', 'Custom message')}</Text>
              <TouchableOpacity onPress={() => setShowCustomMessageModal(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.offerInputContainer}>
              <Text style={styles.offerInputLabel}>{txt('Votre message', 'Your message')}</Text>
              <TextInput
                style={[styles.offerInput, styles.customMessageInput]}
                placeholder={txt('Écrivez votre message...', 'Write your message...')}
                multiline
                numberOfLines={4}
                value={customMessage}
                onChangeText={setCustomMessage}
                autoFocus
              />
            </View>
            
            <View style={styles.offerModalButtons}>
              <TouchableOpacity 
                style={styles.offerCancelButton}
                onPress={() => {
                  setShowCustomMessageModal(false);
                  setCustomMessage('');
                }}
              >
                <Text style={styles.offerCancelButtonText}>{txt('Annuler', 'Cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.offerSubmitButton}
                onPress={submitCustomMessage}
              >
                <Text style={styles.offerSubmitButtonText}>{txt('Envoyer', 'Send')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Safety Tips Modal */}
      <SafetyTipsModal
        visible={showSafetyTipsModal}
        onClose={() => {
          setShowSafetyTipsModal(false);
          setPendingMessage(''); // Clear pending message on close
        }}
        onProceed={() => {
          // Use the pending message if available, otherwise use default greeting
          const messageToSend = pendingMessage || txt(
            `Bonjour! Je suis intéressé par "${listing?.title}" et j'aimerais l'acheter.`,
            `Hi! I'm interested in "${listing?.title}" and I'd like to buy it.`
          );
          proceedToChat(messageToSend);
          setPendingMessage(''); // Clear after using
        }}
      />

      {/* Share Modal */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={listing?.title || ''}
        url={`https://marchecd.tech/listing/${id}`}
        type="listing"
      />

      {/* Promote Modal */}
      <PromoteModal
        visible={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        listingId={id as string}
        onSuccess={loadListing}
      />

      {/* Select Buyer Modal */}
      <SelectBuyerModal
        visible={showSelectBuyerModal}
        onClose={() => setShowSelectBuyerModal(false)}
        listingId={id as string}
        sellerId={user?.id || ''}
        onSuccess={async (buyerId) => {
          // Mark listing as sold and reload
          try {
            const { error } = await supabase
              .from('listings')
              .update({ status: 'sold' })
              .eq('id', id);
            
            if (error) throw error;
            loadListing();
          } catch (error) {
            console.error('Error updating listing status:', error);
          }
        }}
      />

      {/* Guidance: Contact Seller Tooltip */}
      {!loading && listing && user?.id !== listing.seller_id && (
        <Tooltip
          content={{
            id: 'listing_contact_seller',
            title: txt('Contacter le vendeur', 'Contact seller'),
            message: txt('Appuyez ici pour envoyer un message au vendeur et poser vos questions.', 'Tap here to message the seller and ask questions.'),
            placement: 'top',
            icon: 'chatbubble-outline',
            dismissLabel: txt('Compris', 'Got it'),
          }}
          targetRef={messageButtonRef}
          visible={showContactTooltip}
          onDismiss={() => {
            setShowContactTooltip(false);
            guidance.markTooltipDismissed('listing_contact_seller');
          }}
        />
      )}

      {/* Guidance: Image Swipe Hint */}
      {!loading && listing && images.length > 1 && (
        <ContextualPrompt
          message={txt('💡 Astuce : Faites glisser les images pour voir toutes les photos de cet article.', '💡 Tip: Swipe images to see all photos of this item.')}
          actions={[]}
          visible={showImageSwipeHint}
          onDismiss={() => {
            setShowImageSwipeHint(false);
            guidance.markTooltipDismissed('listing_image_swipe');
          }}
          icon="images-outline"
        />
      )}

      {/* Guidance: Quick Actions Prompt */}
      {!loading && listing && user?.id !== listing.seller_id && (
        <ContextualPrompt
          message={txt("Besoin d'aide ? Essayez ces actions rapides pour contacter le vendeur.", 'Need help? Try these quick actions to contact the seller.')}
          actions={[
            {
              label: txt('Message vendeur', 'Message seller'),
              onPress: () => {
                const greeting = txt(
                  `Bonjour! Je suis intéressé par "${listing.title}" et j'aimerais l'acheter.`,
                  `Hi! I'm interested in "${listing.title}" and I'd like to buy it.`
                );
                handleQuickMessage(greeting);
              },
              primary: true,
            },
            {
              label: txt('Sauvegarder', 'Save'),
              onPress: toggleFavorite,
            },
          ]}
          visible={showQuickActionsPrompt}
          onDismiss={() => {
            setShowQuickActionsPrompt(false);
            guidance.markTooltipDismissed('listing_quick_actions');
          }}
          icon="flash-outline"
        />
      )}

      {/* Guidance: Favorite Confirmation */}
      {!loading && listing && (
        <ContextualPrompt
          message={txt('✅ Article ajouté aux favoris ! Retrouvez-le dans votre liste de favoris.', '✅ Item added to favorites! Find it in your favorites list.')}
          actions={[
            {
              label: txt('Voir mes favoris', 'View my favorites'),
              onPress: () => router.push('/favorites'),
              primary: true,
            },
          ]}
          visible={showFavoriteConfirmation}
          onDismiss={() => {
            setShowFavoriteConfirmation(false);
            guidance.markTooltipDismissed('listing_favorite_confirmation');
          }}
          icon="heart-outline"
        />
      )}

      {/* Guidance: Seller Profile Tooltip */}
      {!loading && listing && (
        <Tooltip
          content={{
            id: 'listing_seller_profile',
            title: txt('Profil du vendeur', 'Seller profile'),
            message: txt('Vérifiez toujours le profil du vendeur, ses notes et son historique. Rencontrez-vous dans un lieu public et sûr.', 'Always check the seller profile, ratings, and history. Meet in a safe public place.'),
            placement: 'bottom',
            icon: 'shield-checkmark-outline',
            dismissLabel: txt('Compris', 'Got it'),
          }}
          targetRef={sellerCardRef}
          visible={showSellerProfileTooltip}
          onDismiss={() => {
            setShowSellerProfileTooltip(false);
            guidance.markTooltipDismissed('listing_seller_profile');
          }}
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#a8f5b8',
  },
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
    backgroundColor: Colors.primary,
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
    backgroundColor: '#f8fafc',
  },
  image: {
    width,
    height: 320,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    left: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  imageCountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  thumbnailContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  thumbnailScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  thumbnailWrapper: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbnailWrapperActive: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(168, 245, 184, 0.2)',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 10,
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
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  breadcrumbText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  breadcrumbSeparator: {
    fontSize: 13,
    color: '#cbd5e1',
    marginHorizontal: 6,
  },
  breadcrumbActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 32,
    marginRight: 12,
  },
  headerFavoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMarkSoldButton: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#86efac',
  },
  headerMarkSoldButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 6,
    marginRight: 8,
  },
  reviewsText: {
    fontSize: 14,
    color: Colors.primary,
  },
  recommendText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 6,
    marginRight: 8,
  },
  recommendSubtext: {
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
  sellerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  sellerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  sellerInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  verifiedBadge: {
    backgroundColor: '#22c55e',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  sellerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sellerLocationText: {
    fontSize: 14,
    color: '#64748b',
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  sellerStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  sellerStatDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#e2e8f0',
  },
  viewProfileButton: {
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  viewProfileButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  locationInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationCity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  locationDistance: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mapOverlayText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  circleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  greenCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(168, 245, 184, 0.2)',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
  modalNavLeft: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    alignItems: 'center',
  },
  modalCounterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
  ownerQuickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  promoteButtonQuick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  promoteButtonQuickText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  promotedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  promotedIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceSection: {
    flexShrink: 0,
  },
  footerPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  deliveryText: {
    fontSize: 13,
    color: '#64748b',
  },
  messageButton: {
    flex: 1,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  editButtonFooter: {
    flex: 1,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  offerModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  offerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  offerModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  offerModalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  offerInputContainer: {
    marginBottom: 24,
  },
  offerInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  offerInput: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  customMessageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  offerModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  offerCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  offerCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  offerSubmitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  offerSubmitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
