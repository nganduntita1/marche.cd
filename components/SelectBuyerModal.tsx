import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { X, User, MessageCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';

interface Buyer {
  id: string;
  name: string;
  profile_picture?: string;
  message_count: number;
  last_message_at: string;
}

interface SelectBuyerModalProps {
  visible: boolean;
  onClose: () => void;
  listingId: string;
  sellerId: string;
  onSuccess: (buyerId: string) => void;
}

export default function SelectBuyerModal({
  visible,
  onClose,
  listingId,
  sellerId,
  onSuccess,
}: SelectBuyerModalProps) {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      loadPotentialBuyers();
    }
  }, [visible, listingId]);

  const loadPotentialBuyers = async () => {
    try {
      setLoading(true);

      // Get all conversations for this listing
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          buyer_id,
          buyer:buyer_id (
            id,
            name,
            profile_picture
          ),
          messages (
            id,
            created_at
          )
        `)
        .eq('listing_id', listingId)
        .eq('seller_id', sellerId);

      if (error) throw error;

      // Process and deduplicate buyers
      const buyersMap = new Map<string, Buyer>();
      
      conversations?.forEach((conv: any) => {
        if (conv.buyer && conv.buyer.id) {
          const buyerId = conv.buyer.id;
          const messageCount = conv.messages?.length || 0;
          const lastMessage = conv.messages?.[conv.messages.length - 1];

          if (!buyersMap.has(buyerId)) {
            buyersMap.set(buyerId, {
              id: buyerId,
              name: conv.buyer.name || 'Utilisateur',
              profile_picture: conv.buyer.profile_picture,
              message_count: messageCount,
              last_message_at: lastMessage?.created_at || '',
            });
          } else {
            // Update message count if this conversation has more messages
            const existing = buyersMap.get(buyerId)!;
            existing.message_count += messageCount;
          }
        }
      });

      // Convert to array and sort by message count
      const buyersList = Array.from(buyersMap.values()).sort(
        (a, b) => b.message_count - a.message_count
      );

      setBuyers(buyersList);
    } catch (error) {
      console.error('Error loading buyers:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des acheteurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBuyer = async (buyerId: string) => {
    try {
      setSubmitting(true);

      // Create transaction and notifications
      const { data, error } = await supabase.rpc('create_transaction_with_notifications', {
        p_listing_id: listingId,
        p_seller_id: sellerId,
        p_buyer_id: buyerId,
      });

      if (error) throw error;

      Alert.alert(
        'Succès! 🎉',
        'L\'annonce a été marquée comme vendue. Vous et l\'acheteur pouvez maintenant vous évaluer mutuellement.'
      );
      
      onSuccess(buyerId);
      onClose();
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer la transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const renderBuyer = ({ item }: { item: Buyer }) => (
    <TouchableOpacity
      style={styles.buyerCard}
      onPress={() => handleSelectBuyer(item.id)}
      disabled={submitting}
    >
      <View style={styles.buyerInfo}>
        {item.profile_picture ? (
          <Image
            source={{ uri: item.profile_picture }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={24} color="#fff" />
          </View>
        )}
        
        <View style={styles.buyerDetails}>
          <Text style={styles.buyerName}>{item.name}</Text>
          <View style={styles.messageInfo}>
            <MessageCircle size={14} color="#64748b" />
            <Text style={styles.messageCount}>
              {item.message_count} message{item.message_count > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.selectButton}>
        <Text style={styles.selectButtonText}>Sélectionner</Text>
      </View>
    </TouchableOpacity>
  );

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
            <Text style={styles.title}>Qui a acheté cet article?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Sélectionnez l'acheteur parmi les personnes qui vous ont contacté
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : buyers.length === 0 ? (
            <View style={styles.emptyState}>
              <MessageCircle size={48} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>Aucun message</Text>
              <Text style={styles.emptyStateText}>
                Personne n'a encore envoyé de message pour cet article
              </Text>
            </View>
          ) : (
            <FlatList
              data={buyers}
              renderItem={renderBuyer}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
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
    maxHeight: '80%',
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
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  buyerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  buyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messageCount: {
    fontSize: 13,
    color: '#64748b',
  },
  selectButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
