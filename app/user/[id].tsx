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
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  profile_picture?: string;
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
          <ActivityIndicator size="large" color={Colors.primary} />
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
          <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
        </TouchableOpacity>
        <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          {profile.profile_picture ? (
            <Image 
              source={{ uri: profile.profile_picture }} 
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {profile.name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}

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
    backgroundColor: '#fff',
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 42,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
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
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#64748b',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  rateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingForm: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  listingImage: {
    width: 110,
    height: 110,
    backgroundColor: '#f1f5f9',
  },
  listingInfo: {
    flex: 1,
    padding: 16,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  listingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22c55e',
  },
  listingStatusSold: {
    color: '#ef4444',
  },
  listingDate: {
    fontSize: 13,
    color: '#94a3b8',
  },
  ratingsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyRatings: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
  ratingItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  raterName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  ratingComment: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 8,
  },
  ratingDate: {
    fontSize: 13,
    color: '#94a3b8',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
