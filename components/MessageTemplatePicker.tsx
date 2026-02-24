import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { X, MessageCircle, DollarSign, MapPin, Heart } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';
import { MessageTemplate } from '@/types/guidance';
import GuidanceContentService from '@/services/guidanceContent';

interface MessageTemplatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (message: string) => void;
  language?: 'en' | 'fr';
  context?: Record<string, string>; // For variable substitution
}

type CategoryType = 'inquiry' | 'negotiation' | 'meeting' | 'thanks';

const CATEGORY_CONFIG: Record<CategoryType, { icon: any; color: string; labelEn: string; labelFr: string }> = {
  inquiry: {
    icon: MessageCircle,
    color: '#3b82f6',
    labelEn: 'Inquiry',
    labelFr: 'Demande',
  },
  negotiation: {
    icon: DollarSign,
    color: '#f59e0b',
    labelEn: 'Negotiation',
    labelFr: 'Négociation',
  },
  meeting: {
    icon: MapPin,
    color: '#8b5cf6',
    labelEn: 'Meeting',
    labelFr: 'Rendez-vous',
  },
  thanks: {
    icon: Heart,
    color: '#ec4899',
    labelEn: 'Thanks',
    labelFr: 'Remerciements',
  },
};

export default function MessageTemplatePicker({
  visible,
  onClose,
  onSelect,
  language = 'fr',
  context = {},
}: MessageTemplatePickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('inquiry');
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');

  const templates = GuidanceContentService.getMessageTemplates(selectedCategory, language);

  const handleTemplatePress = (template: MessageTemplate) => {
    if (template.variables && template.variables.length > 0) {
      // If template has variables, open editing mode
      let text = template.text;
      
      // Substitute any provided context variables
      if (Object.keys(context).length > 0) {
        text = GuidanceContentService.substituteVariables(text, context);
      }
      
      setEditedText(text);
      setEditingTemplate(template.id);
    } else {
      // No variables, use template directly
      onSelect(template.text);
      onClose();
    }
  };

  const handleConfirmEdit = () => {
    onSelect(editedText);
    setEditingTemplate(null);
    setEditedText('');
    onClose();
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditedText('');
  };

  const getCategoryLabel = (category: CategoryType) => {
    return language === 'fr' 
      ? CATEGORY_CONFIG[category].labelFr 
      : CATEGORY_CONFIG[category].labelEn;
  };

  const getTitle = () => {
    return language === 'fr' ? 'Modèles de messages' : 'Message Templates';
  };

  const getEditTitle = () => {
    return language === 'fr' ? 'Personnaliser le message' : 'Customize Message';
  };

  const getConfirmLabel = () => {
    return language === 'fr' ? 'Utiliser ce message' : 'Use This Message';
  };

  const getCancelLabel = () => {
    return language === 'fr' ? 'Annuler' : 'Cancel';
  };

  const getVariableHint = () => {
    return language === 'fr' 
      ? 'Remplacez les {{variables}} par vos informations'
      : 'Replace {{variables}} with your information';
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingTemplate ? getEditTitle() : getTitle()}
            </Text>
            <TouchableOpacity 
              onPress={editingTemplate ? handleCancelEdit : onClose} 
              style={styles.closeButton}
            >
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {editingTemplate ? (
            // Editing Mode
            <View style={styles.editContainer}>
              <Text style={styles.variableHint}>{getVariableHint()}</Text>
              <TextInput
                style={styles.textInput}
                value={editedText}
                onChangeText={setEditedText}
                multiline
                numberOfLines={4}
                placeholder={language === 'fr' ? 'Votre message...' : 'Your message...'}
                placeholderTextColor={Colors.textSecondary}
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmEdit}
              >
                <Text style={styles.confirmButtonText}>{getConfirmLabel()}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Category Tabs */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryTabs}
                contentContainerStyle={styles.categoryTabsContent}
              >
                {(Object.keys(CATEGORY_CONFIG) as CategoryType[]).map((category) => {
                  const config = CATEGORY_CONFIG[category];
                  const Icon = config.icon;
                  const isSelected = selectedCategory === category;

                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryTab,
                        isSelected && { 
                          backgroundColor: config.color + '15',
                          borderColor: config.color,
                        },
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Icon 
                        size={18} 
                        color={isSelected ? config.color : Colors.textSecondary} 
                      />
                      <Text
                        style={[
                          styles.categoryTabText,
                          isSelected && { color: config.color, fontWeight: '600' },
                        ]}
                      >
                        {getCategoryLabel(category)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Templates List */}
              <ScrollView 
                style={styles.templatesList}
                showsVerticalScrollIndicator={false}
              >
                {templates.map((template) => {
                  const hasVariables = template.variables && template.variables.length > 0;
                  
                  return (
                    <TouchableOpacity
                      key={template.id}
                      style={styles.templateCard}
                      onPress={() => handleTemplatePress(template)}
                    >
                      <Text style={styles.templateText}>{template.text}</Text>
                      {hasVariables && (
                        <View style={styles.variableBadge}>
                          <Text style={styles.variableBadgeText}>
                            {language === 'fr' ? 'Personnalisable' : 'Customizable'}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
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
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...TextStyles.h4,
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTabs: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryTabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.gray50,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryTabText: {
    ...TextStyles.body,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  templatesList: {
    padding: 20,
  },
  templateCard: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  templateText: {
    ...TextStyles.body,
    color: Colors.text,
    lineHeight: 22,
  },
  variableBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  variableBadgeText: {
    ...TextStyles.smallBold,
    color: Colors.primary,
  },
  editContainer: {
    padding: 20,
  },
  variableHint: {
    ...TextStyles.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  textInput: {
    ...TextStyles.body,
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    ...TextStyles.button,
    color: '#fff',
  },
});
