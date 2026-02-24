// Achievement Celebration Provider
// Global component that shows achievement celebrations

import React from 'react';
import { CelebrationModal } from './CelebrationModal';
import { useAchievementCelebration } from '../../hooks/useAchievementCelebration';

export const AchievementCelebrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isVisible, currentCelebration, closeCelebration } = useAchievementCelebration();

  return (
    <>
      {children}
      <CelebrationModal
        visible={isVisible}
        achievement={currentCelebration}
        onClose={closeCelebration}
      />
    </>
  );
};
