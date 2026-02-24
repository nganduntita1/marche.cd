// Achievement Celebration Hook
// Manages showing celebration modals when achievements are unlocked

import { useState, useEffect, useCallback } from 'react';
import { useGuidance } from '../contexts/GuidanceContext';
import { Achievement } from '../types/guidance';

export const useAchievementCelebration = () => {
  const { state, getAchievements } = useGuidance();
  const [celebrationQueue, setCelebrationQueue] = useState<Achievement[]>([]);
  const [currentCelebration, setCurrentCelebration] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Check for new achievements
  useEffect(() => {
    if (!state) return;

    const achievements = getAchievements();
    const recentlyCompleted = achievements.filter(achievement => {
      if (!achievement.completed || !achievement.completedAt) return false;
      
      // Check if completed in the last 5 seconds
      const completedTime = new Date(achievement.completedAt).getTime();
      const now = Date.now();
      const fiveSecondsAgo = now - 5000;
      
      return completedTime > fiveSecondsAgo;
    });

    if (recentlyCompleted.length > 0) {
      setCelebrationQueue(prev => {
        // Only add achievements that aren't already in the queue
        const newAchievements = recentlyCompleted.filter(
          achievement => !prev.some(a => a.id === achievement.id)
        );
        return [...prev, ...newAchievements];
      });
    }
  }, [state?.completedAchievements, state?.achievementDates]);

  // Show next celebration from queue
  useEffect(() => {
    if (celebrationQueue.length > 0 && !isVisible && !currentCelebration) {
      const [next, ...rest] = celebrationQueue;
      setCurrentCelebration(next);
      setIsVisible(true);
      setCelebrationQueue(rest);
    }
  }, [celebrationQueue, isVisible, currentCelebration]);

  // Close celebration
  const closeCelebration = useCallback(() => {
    setIsVisible(false);
    // Wait for animation to complete before clearing
    setTimeout(() => {
      setCurrentCelebration(null);
    }, 300);
  }, []);

  return {
    isVisible,
    currentCelebration,
    closeCelebration,
  };
};
