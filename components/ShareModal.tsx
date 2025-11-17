import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Clipboard,
} from 'react-native';
import { X, Share2, Copy, MessageCircle, Facebook, Twitter, Link as LinkIcon } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  url: string;
  type: 'listing' | 'profile';
}

export default function ShareModal({ visible, onClose, title, url, type }: ShareModalProps) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${title}\n\n${url}`,
        url: url,
        title: title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = () => {
    Clipboard.setString(url);
    Alert.alert('Succès', 'Lien copié dans le presse-papier!');
    onClose();
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`${title}\n\n${url}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    // In a real app, you'd use Linking.openURL(whatsappUrl)
    handleCopyLink(); // For now, just copy the link
  };

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    // In a real app, you'd use Linking.openURL(facebookUrl)
    handleCopyLink(); // For now, just copy the link
  };

  const handleTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    // In a real app, you'd use Linking.openURL(twitterUrl)
    handleCopyLink(); // For now, just copy the link
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Partager {type === 'listing' ? "l'annonce" : 'le profil'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Share Options */}
          <View style={styles.options}>
            <TouchableOpacity style={styles.option} onPress={handleShare}>
              <View style={[styles.optionIcon, { backgroundColor: '#f0fdf4' }]}>
                <Share2 size={24} color={Colors.primary} />
              </View>
              <Text style={styles.optionText}>Partager</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleCopyLink}>
              <View style={[styles.optionIcon, { backgroundColor: '#eff6ff' }]}>
                <Copy size={24} color="#3b82f6" />
              </View>
              <Text style={styles.optionText}>Copier le lien</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleWhatsApp}>
              <View style={[styles.optionIcon, { backgroundColor: '#dcfce7' }]}>
                <MessageCircle size={24} color="#22c55e" />
              </View>
              <Text style={styles.optionText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleFacebook}>
              <View style={[styles.optionIcon, { backgroundColor: '#dbeafe' }]}>
                <Facebook size={24} color="#3b82f6" />
              </View>
              <Text style={styles.optionText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleTwitter}>
              <View style={[styles.optionIcon, { backgroundColor: '#dbeafe' }]}>
                <Twitter size={24} color="#3b82f6" />
              </View>
              <Text style={styles.optionText}>Twitter</Text>
            </TouchableOpacity>
          </View>

          {/* Link Preview */}
          <View style={styles.linkPreview}>
            <LinkIcon size={16} color="#64748b" />
            <Text style={styles.linkText} numberOfLines={1}>
              {url}
            </Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
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
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  option: {
    alignItems: 'center',
    width: '30%',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  linkPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
  },
});
