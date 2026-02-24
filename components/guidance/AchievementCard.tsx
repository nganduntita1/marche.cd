// Achievement Card Component
// Displays individual achievement with completion status

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Achievement } from '../../types/guidance';
import Colors from '../../constants/Colors';
import { TextStyles } from '../../constants/Typography';

interface AchievementCardProps {
  achievement: Achievement;
  showProgress?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  showProgress = true,
}) => {
  const hasProgress = achievement.maxProgress !== undefined && achievement.progress !== undefined;
  const progressPercentage = hasProgress
    ? (achievement.progress! / achievement.maxProgress!) * 100
    : 0;

  return (
    <View style={[styles.container, achievement.completed && styles.containerCompleted]}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{achievement.icon}</Text>
        {achievement.completed && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, achievement.completed && styles.titleCompleted]}>
          {achievement.title}
        </Text>
        <Text style={styles.description}>{achievement.description}</Text>

        {/* Progress Bar for Progressive Achievements */}
        {hasProgress && showProgress && !achievement.completed && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress}/{achievement.maxProgress}
            </Text>
          </View>
        )}

        {/* Reward */}
        {achievement.reward && achievement.completed && (
          <View style={styles.rewardContainer}>
            <Text style={styles.rewardIcon}>🎁</Text>
            <Text style={styles.rewardText}>{achievement.reward}</Text>
          </View>
        )}

        {/* Completion Date */}
        {achievement.completed && achievement.completedAt && (
          <Text style={styles.completedDate}>
            Complété le {new Date(achievement.completedAt).toLocaleDateString('fr-FR')}
          </Text>
        )}
      </View>

      {/* Category Badge */}
      <View style={[styles.categoryBadge, styles[`category_${achievement.category}`]]}>
        <Text style={styles.categoryText}>{getCategoryLabel(achievement.category)}</Text>
      </View>
    </View>
  );
};

const getCategoryLabel = (category: Achievement['category']): string => {
  const labels = {
    onboarding: 'Démarrage',
    social: 'Social',
    seller: 'Vendeur',
    buyer: 'Acheteur',
    milestone: 'Jalon',
  };
  return labels[category] || category;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  containerCompleted: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  icon: {
    fontSize: 40,
  },
  completedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    ...TextStyles.h3,
    marginBottom: 4,
    color: Colors.text,
  },
  titleCompleted: {
    color: Colors.primary,
  },
  description: {
    ...TextStyles.body,
    color: Colors.gray600,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...TextStyles.small,
    color: Colors.gray600,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF9E6',
    borderRadius: 6,
  },
  rewardIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  rewardText: {
    ...TextStyles.small,
    color: '#B8860B',
    fontWeight: '500',
    flex: 1,
  },
  completedDate: {
    ...TextStyles.small,
    color: Colors.gray500,
    marginTop: 4,
    fontStyle: 'italic',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  categoryText: {
    ...TextStyles.small,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  category_onboarding: {
    backgroundColor: '#10B981',
  },
  category_social: {
    backgroundColor: '#8B5CF6',
  },
  category_seller: {
    backgroundColor: '#F59E0B',
  },
  category_buyer: {
    backgroundColor: '#3B82F6',
  },
  category_milestone: {
    backgroundColor: '#EF4444',
  },
});
