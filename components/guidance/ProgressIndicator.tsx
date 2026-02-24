// Progress Indicator Component
// Displays onboarding progress with visual steps

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressStep } from '../../types/guidance';
import Colors from '../../constants/Colors';
import { TextStyles } from '../../constants/Typography';

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep?: number;
  showLabels?: boolean;
  compact?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  showLabels = true,
  compact = false,
}) => {
  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const percentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactProgressBar}>
          <View style={[styles.compactProgressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.compactText}>
          {completedCount}/{totalSteps} complété
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
      </View>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepItem}>
            <View style={styles.stepIndicator}>
              <View
                style={[
                  styles.stepCircle,
                  step.completed && styles.stepCircleCompleted,
                  currentStep === index && styles.stepCircleCurrent,
                ]}
              >
                {step.completed ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepConnector,
                    step.completed && styles.stepConnectorCompleted,
                  ]}
                />
              )}
            </View>
            {showLabels && (
              <View style={styles.stepLabelContainer}>
                <Text
                  style={[
                    styles.stepLabel,
                    step.completed && styles.stepLabelCompleted,
                  ]}
                >
                  {step.label}
                </Text>
                {step.optional && (
                  <Text style={styles.optionalBadge}>Optionnel</Text>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  percentageText: {
    ...TextStyles.body,
    fontWeight: '600',
    color: Colors.primary,
    minWidth: 45,
    textAlign: 'right',
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 12,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gray300,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleCurrent: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepNumber: {
    ...TextStyles.small,
    fontWeight: '600',
    color: Colors.gray600,
  },
  stepConnector: {
    width: 2,
    height: 16,
    backgroundColor: Colors.gray300,
    marginTop: 4,
  },
  stepConnectorCompleted: {
    backgroundColor: Colors.primary,
  },
  stepLabelContainer: {
    flex: 1,
    paddingTop: 4,
  },
  stepLabel: {
    ...TextStyles.body,
    color: Colors.gray600,
    marginBottom: 4,
  },
  stepLabelCompleted: {
    color: Colors.text,
    fontWeight: '500',
  },
  optionalBadge: {
    ...TextStyles.small,
    color: Colors.gray500,
    fontStyle: 'italic',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  compactProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  compactText: {
    ...TextStyles.small,
    color: Colors.gray600,
    fontWeight: '500',
  },
});
