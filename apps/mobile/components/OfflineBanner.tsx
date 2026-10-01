import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { WifiOff, X } from "lucide-react-native";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
      if (!offline) {
        setIsDismissed(false); // Reset dismissal when connection is restored
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline || isDismissed) {
    return null;
  }

  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <View style={styles.content}>
        <WifiOff size={16} color="#fbbf24" style={styles.icon} />
        <Text style={styles.text}>You&apos;re offline. Showing cached data.</Text>
      </View>
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={() => setIsDismissed(true)}
        accessibilityLabel="Dismiss offline banner"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={16} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#1e1b18",
    borderColor: "#b45309",
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 9999,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: "#fef3c7",
    fontSize: 13,
    fontWeight: "500",
  },
  dismissBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
