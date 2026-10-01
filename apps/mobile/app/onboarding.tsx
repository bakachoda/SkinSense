import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { OnboardingFlow } from "../components/OnboardingFlow";
import { useQuestionnaireStore } from "../stores/questionnaire";

export default function OnboardingScreen() {
  const hasCompletedQuestionnaire = useQuestionnaireStore((s) => s.hasCompletedQuestionnaire);

  return (
    <View style={styles.container}>
      <OnboardingFlow
        onComplete={() => {
          if (!hasCompletedQuestionnaire) {
            router.replace("/");
          } else {
            router.replace("/(tabs)/home");
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f19",
  },
});
