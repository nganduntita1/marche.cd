import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Star } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  transactionId: string;
  revieweeId: string;
  revieweeName: string;
  listingId: string;
  onSuccess: () => void;
}

export default function RatingModal({
  visible,
  onClose,
  transactionId,
  revieweeId,
  revieweeName,
  listingId,
  onSuccess,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner une note');
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase.rpc('submit_review', {
        p_transaction_id: transactionId,
        p_reviewer_id: user.id,
        p_reviewee_id: revieweeId,
        p_listing_id: listingId,
        p_rating: rating,
        p_comment: comment.trim() || null,
      });

      if (error) throw error;

      Alert.alert('Merci! 🎉', 'Votre évaluation a été enregistrée');
      onSuccess();
      onClose();
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert('Erreur', error.message || 'Impossible d\'enregistrer l\'évaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Évaluer {revieweeName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.question}>
              Comment s'est passée votre transaction?
            </Text>

            {/* Star Rating */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Star
                    size={40}
                    color={star <= rating ? '#fbbf24' : '#e2e8f0'}
                    fill={star <= rating ? '#fbbf24' : 'transparent'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 5 && '⭐ Excellent!'}
                {rating === 4 && '😊 Très bien'}
                {rating === 3 && '👍 Bien'}
                {rating === 2 && '😐 Moyen'}
                {rating === 1 && '😞 Mauvais'}
              </Text>
            )}

            {/* Comment (Optional) */}
            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>
                Commentaire (optionnel)
              </Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Partagez votre expérience..."
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {comment.length}/500
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, (rating === 0 || loading) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={rating === 0 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Envoyer l'évaluation
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  question: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 24,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1e293b',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
