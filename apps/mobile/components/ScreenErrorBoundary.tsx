import * as Sentry from "@sentry/react-native";
import { View, Text, Pressable } from "react-native";

interface FallbackProps {
  resetError: () => void;
}

function ErrorFallback({ resetError }: FallbackProps) {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <Text className="text-lg font-semibold text-gray-800">Something went wrong</Text>
      <Text className="mt-2 text-center text-sm text-gray-500">
        An unexpected error occurred. Please try again.
      </Text>
      <Pressable
        className="mt-6 rounded-lg bg-primary-600 px-6 py-3"
        onPress={resetError}
      >
        <Text className="font-medium text-white">Try Again</Text>
      </Pressable>
    </View>
  );
}

export const ScreenErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  { fallback: (props) => <ErrorFallback resetError={props.resetError} /> },
);
