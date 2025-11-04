import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

type ListingCardProps = {
  id: string;
  title: string;
  price: number;
  image: string;
  status: 'active' | 'sold';
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 64) / 2; // 2 columns with 24px padding on sides and 16px gap

export default function ListingCard({ id, title, price, image, status }: ListingCardProps) {
  const router = useRouter();

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
          resizeMode="cover"
        />
        {status === 'sold' && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldText}>VENDU</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.price}>
          {price.toLocaleString('fr-FR')} $
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardSold: {
    opacity: 0.7,
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  soldBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  soldText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
    height: 40,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9bbd1f',
  },
});
