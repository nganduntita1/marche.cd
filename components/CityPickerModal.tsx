import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { CONGO_CITIES } from '@/services/locationService';
import { MapPin, X, Navigation } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: { name: string; latitude: number; longitude: number }) => void;
  onDetectLocation?: () => void;
}

export default function CityPickerModal({
  visible,
  onClose,
  onSelect,
  onDetectLocation,
}: CityPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choisir une ville</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {onDetectLocation && (
            <TouchableOpacity style={styles.detectButton} onPress={onDetectLocation}>
              <Navigation size={20} color={Colors.primary} />
              <Text style={styles.detectButtonText}>Détecter ma position</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={CONGO_CITIES}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cityItem}
                onPress={() => onSelect(item)}
              >
                <MapPin size={20} color="#64748b" />
                <Text style={styles.cityName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  detectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cityName: {
    fontSize: 16,
    color: '#1e293b',
  },
});
