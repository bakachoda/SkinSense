import React, { useState } from "react";
import { Redirect, router } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useOnboardingStore } from "../stores/onboarding";
import { useQuestionnaireStore } from "../stores/questionnaire";
import { OnboardingFlow } from "../components/OnboardingFlow";
import { QuestionnaireWizard } from "../components/QuestionnaireWizard";

export default function Index() {
  const hasAcknowledgedDisclaimer = useOnboardingStore((s) => s.hasAcknowledgedDisclaimer);
  const hasSeenWelcome = useOnboardingStore((s) => s.hasSeenWelcome);
  const hasCompletedQuestionnaire = useQuestionnaireStore((s) => s.hasCompletedQuestionnaire);
  const completeQuestionnaire = useQuestionnaireStore((s) => s.completeQuestionnaire);

  const [wizardStepActive, setWizardStepActive] = useState(!hasCompletedQuestionnaire);

  // 1. Returning user with disclaimer acknowledged and completed questionnaire -> Home tab
  if (hasAcknowledgedDisclaimer && hasCompletedQuestionnaire) {
    return <Redirect href="/(tabs)/home" />;
  }

  // 2. Needs disclaimer or initial onboarding
  if (!hasAcknowledgedDisclaimer) {
    return (
      <View style={styles.container}>
        <OnboardingFlow
          initialStep={hasSeenWelcome ? 2 : 1}
          onComplete={() => {
            // After disclaimer and permissions, advance to questionnaire if needed
            if (!hasCompletedQuestionnaire) {
              setWizardStepActive(true);
            } else {
              router.replace("/(tabs)/home");
            }
          }}
        />
      </View>
    );
  }

  // 3. Disclaimer acknowledged but questionnaire incomplete
  if (wizardStepActive && !hasCompletedQuestionnaire) {
    return (
      <View style={styles.container}>
        <QuestionnaireWizard
          onComplete={() => {
            completeQuestionnaire();
            router.replace("/(tabs)/home");
          }}
        />
      </View>
    );
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f19",
  },
});
