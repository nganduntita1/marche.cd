import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Phone, MessageCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { ListingWithDetails } from '@/types/database';

const { width } = Dimensions.get('window');
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, Button } from '@/components/ui';
import { Pencil, Trash2 } from 'lucide-react-native';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<ListingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Annonce introuvable</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
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
      <ScrollView>
        <View style={styles.imageContainer}>
          <ScrollView
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
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.image}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>

          {images.length > 1 && (
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
          )}
        </View>

        <View style={styles.content}>
          {listing.is_featured && (
            <View style={styles.featuredBanner}>
              <Text style={styles.featuredText}>Annonce en vedette</Text>
            </View>
          )}

          <View style={styles.header}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>{formatPrice(listing.price)}</Text>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#64748b" />
              <Text style={styles.metaText}>{listing.location}</Text>
            </View>
            {listing.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{listing.category.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>État</Text>
              <Text style={styles.detailValue}>
                {getConditionLabel(listing.condition)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Publié le</Text>
              <Text style={styles.detailValue}>
                {formatDate(listing.created_at)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vendeur</Text>
            <View style={styles.sellerCard}>
              <View style={styles.sellerInfo}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerInitial}>
                    {listing.seller.name[0].toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.sellerName}>{listing.seller.name}</Text>
                  <Text style={styles.sellerLocation}>
                    {listing.seller.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <MessageCircle size={20} color="#fff" />
          <Text style={styles.whatsappButtonText}>Contacter sur WhatsApp</Text>
        </TouchableOpacity>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width,
    height: 300,
    backgroundColor: '#f1f5f9',
  },
  backIconButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    padding: 16,
  },
  featuredBanner: {
    backgroundColor: '#dcfce7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  featuredText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#16a34a',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
  },
  categoryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  sellerCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  sellerLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
