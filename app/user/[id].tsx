import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  created_at: string;
};

type Rating = {
  id: string;
  rating: number;
  comment: string | null;
  rated_by: string;
  created_at: string;
  rater: {
    name: string;
  };
};

type Listing = {
  id: string;
  title: string;
  price: number;
  images: string[];
  status: string;
  created_at: string;
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState<Rating | null>(null);

  useEffect(() => {
    if (id) {
      loadProfile();
      loadRatings();
      loadListings();
    }
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data);

      // Get average rating
      const { data: ratingData } = await supabase
        .rpc('get_user_rating', { user_uuid: id });

      if (ratingData && ratingData.length > 0) {
        setAverageRating(parseFloat(ratingData[0].average_rating) || 0);
        setTotalRatings(parseInt(ratingData[0].total_ratings) || 0);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          rater:users!ratings_rated_by_fkey(name)
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRatings(data || []);

      // Check if current user has rated
      if (user) {
        const myRating = data?.find((r) => r.rated_by === user.id);
        setUserRating(myRating || null);
        if (myRating) {
          setNewRating(myRating.rating);
          setNewComment(myRating.comment || '');
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const loadListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, images, status, created_at')
        .eq('seller_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const submitRating = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour noter cet utilisateur');
      return;
    }

    if (user.id === id) {
      Alert.alert('Erreur', 'Vous ne pouvez pas vous noter vous-même');
      return;
    }

    if (newRating === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner une note');
      return;
    }

    setSubmitting(true);
    try {
      if (userRating) {
        // Update existing rating
        const { error } = await supabase
          .from('ratings')
          .update({
            rating: newRating,
            comment: newComment.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userRating.id);

        if (error) throw error;
      } else {
        // Create new rating
        const { error } = await supabase.from('ratings').insert({
          user_id: id,
          rated_by: user.id,
          rating: newRating,
          comment: newComment.trim() || null,
        });

        if (error) throw error;
      }

      Alert.alert('Succès', 'Votre note a été enregistrée');
      setShowRatingForm(false);
      loadProfile();
      loadRatings();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      Alert.alert('Erreur', error.message || 'Impossible d\'enregistrer la note');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: number = 20, interactive: boolean = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && setNewRating(star)}
            disabled={!interactive}
          >
            <Star
              size={size}
              color="#fbbf24"
              fill={star <= rating ? '#fbbf24' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9bbd1f" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Utilisateur introuvable</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {profile.name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>

          <Text style={styles.userName}>{profile.name || 'Utilisateur'}</Text>
          
          {profile.location && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#64748b" />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          )}

          <View style={styles.ratingContainer}>
            {renderStars(averageRating, 24)}
            <Text style={styles.ratingText}>
              {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'avis' : 'avis'})
            </Text>
          </View>

          {user && user.id !== id && (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => setShowRatingForm(!showRatingForm)}
            >
              <Text style={styles.rateButtonText}>
                {userRating ? 'Modifier ma note' : 'Noter cet utilisateur'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showRatingForm && (
          <View style={styles.ratingForm}>
            <Text style={styles.formTitle}>Votre note</Text>
            {renderStars(newRating, 32, true)}
            
            <TextInput
              style={styles.commentInput}
              placeholder="Commentaire (optionnel)"
              placeholderTextColor="#94a3b8"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowRatingForm(false);
                  setNewRating(userRating?.rating || 0);
                  setNewComment(userRating?.comment || '');
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={submitRating}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Envoi...' : 'Envoyer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>Annonces ({listings.length})</Text>
          
          {listings.length === 0 ? (
            <View style={styles.emptyRatings}>
              <Text style={styles.emptyText}>Aucune annonce</Text>
            </View>
          ) : (
            listings.map((listing) => (
              <TouchableOpacity
                key={listing.id}
                style={styles.listingItem}
                onPress={() => router.push(`/listing/${listing.id}`)}
              >
                <Image
                  source={{ uri: listing.images[0] }}
                  style={styles.listingImage}
                />
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle} numberOfLines={2}>
                    {listing.title}
                  </Text>
                  <Text style={styles.listingPrice}>${listing.price}</Text>
                  <View style={styles.listingMeta}>
                    <Text style={[
                      styles.listingStatus,
                      listing.status === 'sold' && styles.listingStatusSold
                    ]}>
                      {listing.status === 'active' ? '🟢 Active' : '🔴 Vendue'}
                    </Text>
                    <Text style={styles.listingDate}>
                      {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.ratingsSection}>
          <Text style={styles.sectionTitle}>Avis ({ratings.length})</Text>
          
          {ratings.length === 0 ? (
            <View style={styles.emptyRatings}>
              <Text style={styles.emptyText}>Aucun avis pour le moment</Text>
            </View>
          ) : (
            ratings.map((rating) => (
              <View key={rating.id} style={styles.ratingItem}>
                <View style={styles.ratingHeader}>
                  <Text style={styles.raterName}>{rating.rater?.name || 'Utilisateur'}</Text>
                  {renderStars(rating.rating, 16)}
                </View>
                {rating.comment && (
                  <Text style={styles.ratingComment}>{rating.comment}</Text>
                )}
                <Text style={styles.ratingDate}>
                  {new Date(rating.created_at).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#bedc39',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9bbd1f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#64748b',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#64748b',
  },
  rateButton: {
    backgroundColor: '#9bbd1f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingForm: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: 16,
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#9bbd1f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listingsSection: {
    padding: 16,
  },
  listingItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  listingImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f1f5f9',
  },
  listingInfo: {
    flex: 1,
    padding: 12,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9bbd1f',
    marginBottom: 8,
  },
  listingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  listingStatusSold: {
    color: '#ef4444',
  },
  listingDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  ratingsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyRatings: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
  ratingItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  raterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  ratingComment: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 8,
  },
  ratingDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  button: {
    backgroundColor: '#9bbd1f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
