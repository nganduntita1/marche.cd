import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MapPin, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface LocationHeaderProps {
  city: string | null;
  loading?: boolean;
  onPress: () => void;
}

export default function LocationHeader({ city, loading, onPress }: LocationHeaderProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <MapPin size={16} color="#1e293b" strokeWidth={2} />
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <>
          <Text style={styles.cityText}>{city || 'Choisir une ville'}</Text>
          <ChevronDown size={14} color="#64748b" />
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignSelf: 'flex-start',
  },
  cityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});
