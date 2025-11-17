import React, { useState, useEffect } from 'react';
import {
View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Star, CheckCircle2, Heart, Trash2, Edit3 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

type ListingCardProps = {
  id: string;
  title: string;
  price: number;
  image: string;
  status: 'active' | 'sold';
  location?: string;
  distance?: number;
  sellerRating?: number;
  isVerified?: boolean;
  isOwner?: boolean;
  isPromoted?: boolean;
  onDelete?: () => void;
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 64) / 2; // 2 columns with 24px padding on sides and 16px gap

export default function ListingCard({ 
  id, 
  title, 
  price, 
  image, 
  status,
  location,
  distance,
  sellerRating,
  isVerified = false,
  isOwner = false,
  isPromoted = false,
  onDelete
}: ListingCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOwner) {
      checkFavoriteStatus();
    }
  }, [id, isOwner]);

  const checkFavoriteStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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

  const toggleFavorite = async (e: any) => {
    e.stopPropagation();
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

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
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: any) => {
    e.stopPropagation();
    
    Alert.alert(
      'Supprimer l\'annonce',
      'Êtes-vous sûr de vouloir supprimer cette annonce ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', id)
                .eq('seller_id', user.id);

              if (error) throw error;
              
              if (onDelete) onDelete();
              Alert.alert('Succès', 'Annonce supprimée');
            } catch (error) {
              console.error('Error deleting listing:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'annonce');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (e: any) => {
    e.stopPropagation();
    router.push(`/edit-listing/${id}`);
  };

  return (
    <TouchableOpacity
      style={[styles.card, status === 'sold' && styles.cardSold]}
      onPress={() => router.push(`/listing/${id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="contain"
        />
        {status === 'sold' && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldText}>VENDU</Text>
          </View>
        )}
        
        {isPromoted && status !== 'sold' && (
          <View style={styles.promotedBadge}>
            <Text style={styles.promotedBadgeText}>⭐ PROMU</Text>
          </View>
        )}
        
        {isOwner ? (
          <View style={styles.ownerActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Edit3 size={18} color="#1e293b" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color="#ef4444" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Heart
              size={20}
              color={isFavorite ? '#ef4444' : '#fff'}
              fill={isFavorite ? '#ef4444' : 'transparent'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        {(location || distance !== undefined) && (
          <View style={styles.locationContainer}>
            <MapPin size={12} color="#64748b" />
            <Text style={styles.location} numberOfLines={1}>
              {distance !== undefined 
                ? `${distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}${location ? ` • ${location}` : ''}`
                : location
              }
            </Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {price.toLocaleString('fr-FR')} $
            </Text>
          </View>
          
          {(sellerRating || isVerified) && (
            <View style={styles.trustBadges}>
              {sellerRating && sellerRating > 0 && (
                <View style={styles.ratingBadge}>
                  <Star size={10} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.ratingText}>{sellerRating.toFixed(1)}</Text>
                </View>
              )}
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <CheckCircle2 size={14} color="#fff" fill={Colors.primary} />
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardSold: {
    opacity: 0.75,
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#f8fafc',
    position: 'relative',
    padding: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  soldBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  soldText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  promotedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  promotedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ownerActions: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  location: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  trustBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  verifiedBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
