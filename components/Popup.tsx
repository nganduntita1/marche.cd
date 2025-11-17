import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

type PopupProps = {
  visible: boolean;
  title: string;
  message: string;
  buttonText: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function Popup({ visible, title, message, buttonText, onClose, onConfirm }: PopupProps) {
  const getIcon = () => {
    if (title.toLowerCase().includes('succès') || title.toLowerCase().includes('publiée')) return '🎉';
    if (title.toLowerCase().includes('crédit') || title.toLowerCase().includes('épuisé')) return '💳';
    if (title.toLowerCase().includes('erreur')) return '❌';
    return '✨';
  };

  const getButtonColors = () => {
    if (title.toLowerCase().includes('crédit') || title.toLowerCase().includes('épuisé')) {
      return [Colors.primary, '#7da01a'];
    }
    if (title.toLowerCase().includes('erreur')) {
      return ['#ef4444', '#dc2626'];
    }
    return [Colors.primary, '#7da01a'];
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.popup}>
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.popupGradient}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>{getIcon()}</Text>
                </View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>
                <TouchableOpacity style={styles.button} onPress={onConfirm}>
                  <LinearGradient
                    colors={getButtonColors()}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>{buttonText}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    borderRadius: 24,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  popupGradient: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});