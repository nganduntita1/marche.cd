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
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  cardSold: {
    opacity: 0.8,
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
    top: 12,
    right: 12,
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  soldText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    height: 40,
    lineHeight: 20,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9bbd1f',
  },
});
