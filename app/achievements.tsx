// Achievements Screen
// Displays all achievements and user progress

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGuidance } from '../contexts/GuidanceContext';
import { AchievementCard } from '../components/guidance/AchievementCard';
import { ProgressIndicator } from '../components/guidance/ProgressIndicator';
import { Achievement } from '../types/guidance';
import Colors from '../constants/Colors';
import { TextStyles } from '../constants/Typography';

type FilterType = 'all' | 'completed' | 'in_progress';
type CategoryType = 'all' | Achievement['category'];

export default function AchievementsScreen() {
  const router = useRouter();
  const { getAchievements, getOnboardingProgress, getOnboardingCompletionPercentage } = useGuidance();
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [category, setCategory] = useState<CategoryType>('all');

  const achievements = getAchievements();
  const onboardingSteps = getOnboardingProgress();
  const completionPercentage = getOnboardingCompletionPercentage();

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    // Filter by completion status
    if (filter === 'completed' && !achievement.completed) return false;
    if (filter === 'in_progress' && achievement.completed) return false;

    // Filter by category
    if (category !== 'all' && achievement.category !== category) return false;

    return true;
  });

  const completedCount = achievements.filter(a => a.completed).length;
  const totalCount = achievements.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Succès</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Progress */}
        <View style={styles.overallProgress}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Débloqués</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalCount - completedCount}</Text>
              <Text style={styles.statLabel}>Restants</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completionPercentage}%</Text>
              <Text style={styles.statLabel}>Progression</Text>
            </View>
          </View>
        </View>

        {/* Onboarding Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progression de l'intégration</Text>
          <View style={styles.card}>
            <ProgressIndicator steps={onboardingSteps} showLabels={true} />
          </View>
        </View>

        {/* Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filtres</Text>
          
          {/* Status Filter */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                Tous
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
              onPress={() => setFilter('completed')}
            >
              <Text style={[styles.filterButtonText, filter === 'completed' && styles.filterButtonTextActive]}>
                Complétés
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'in_progress' && styles.filterButtonActive]}
              onPress={() => setFilter('in_progress')}
            >
              <Text style={[styles.filterButtonText, filter === 'in_progress' && styles.filterButtonTextActive]}>
                En cours
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <TouchableOpacity
              style={[styles.categoryButton, category === 'all' && styles.categoryButtonActive]}
              onPress={() => setCategory('all')}
            >
              <Text style={[styles.categoryButtonText, category === 'all' && styles.categoryButtonTextActive]}>
                Tous
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryButton, category === 'onboarding' && styles.categoryButtonActive]}
              onPress={() => setCategory('onboarding')}
            >
              <Text style={[styles.categoryButtonText, category === 'onboarding' && styles.categoryButtonTextActive]}>
                Démarrage
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryButton, category === 'buyer' && styles.categoryButtonActive]}
              onPress={() => setCategory('buyer')}
            >
              <Text style={[styles.categoryButtonText, category === 'buyer' && styles.categoryButtonTextActive]}>
                Acheteur
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryButton, category === 'seller' && styles.categoryButtonActive]}
              onPress={() => setCategory('seller')}
            >
              <Text style={[styles.categoryButtonText, category === 'seller' && styles.categoryButtonTextActive]}>
                Vendeur
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryButton, category === 'social' && styles.categoryButtonActive]}
              onPress={() => setCategory('social')}
            >
              <Text style={[styles.categoryButtonText, category === 'social' && styles.categoryButtonTextActive]}>
                Social
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryButton, category === 'milestone' && styles.categoryButtonActive]}
              onPress={() => setCategory('milestone')}
            >
              <Text style={[styles.categoryButtonText, category === 'milestone' && styles.categoryButtonTextActive]}>
                Jalons
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Achievements List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Succès ({filteredAchievements.length})
          </Text>
          {filteredAchievements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🏆</Text>
              <Text style={styles.emptyStateText}>
                Aucun succès trouvé avec ces filtres
              </Text>
            </View>
          ) : (
            filteredAchievements.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                showProgress={true}
              />
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.text,
  },
  headerTitle: {
    ...TextStyles.h2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  overallProgress: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TextStyles.h1,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...TextStyles.small,
    color: Colors.gray600,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray200,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TextStyles.h3,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    ...TextStyles.body,
    color: Colors.gray600,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    ...TextStyles.small,
    color: Colors.gray600,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: Colors.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateText: {
    ...TextStyles.body,
    color: Colors.gray600,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
