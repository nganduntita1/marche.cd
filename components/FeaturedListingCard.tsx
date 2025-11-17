import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, TrendingUp, Eye } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

interface FeaturedListingCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  location?: string;
  views?: number;
  isFeatured?: boolean;
}

export default function FeaturedListingCard({
  id,
  title,
  price,
  image,
  location,
  views,
  isFeatured = true,
}: FeaturedListingCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/listing/${id}`);
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {isFeatured && (
        <View style={styles.featuredBadge}>
          <TrendingUp size={14} color="#fff" />
          <Text style={styles.featuredText}>En vedette</Text>
        </View>
      )}
      
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: image }} 
          style={styles.image}
          resizeMode="cover"
        />
        {views && views > 0 && (
          <View style={styles.viewsBadge}>
            <Eye size={12} color="#fff" />
            <Text style={styles.viewsText}>{views}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>${price.toLocaleString()}</Text>
          {location && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color={Colors.textLight} />
              <Text style={styles.location} numberOfLines={1}>
                {location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  featuredText: {
    ...TextStyles.smallBold,
    color: '#fff',
    fontSize: 11,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.gray100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  viewsBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewsText: {
    ...TextStyles.small,
    color: '#fff',
    fontSize: 11,
  },
  content: {
    padding: 16,
  },
  title: {
    ...TextStyles.h5,
    color: Colors.text,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    ...TextStyles.bodyBold,
    fontSize: 20,
    color: Colors.primary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  location: {
    ...TextStyles.small,
    color: Colors.textLight,
    flex: 1,
  },
});
