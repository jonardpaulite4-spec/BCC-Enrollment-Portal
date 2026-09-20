import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const getExpoHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri || Constants.expoGo?.debuggerHost || "";
  return hostUri.replace(/^[a-z]+:\/\//i, "").split(":")[0];
};

const getPortalUrl = () => {
  if (process.env.EXPO_PUBLIC_PORTAL_URL) {
    return process.env.EXPO_PUBLIC_PORTAL_URL.replace(/\/$/, "");
  }

  const expoHost = getExpoHost();
  if (expoHost) return `http://${expoHost}:4000`;
  if (Platform.OS === "android") return "http://10.0.2.2:4000";
  return "http://localhost:4000";
};

export default function App() {
  const webViewRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const portalUrl = useMemo(getPortalUrl, []);

  const reload = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setAttempt((value) => value + 1);
    webViewRef.current?.reload();
  }, []);

  useEffect(() => {
    if (!isLoading) return undefined;
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setHasError(true);
    }, 15000);
    return () => clearTimeout(timeout);
  }, [attempt, isLoading]);

  if (hasError) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorCard}>
          <Text style={styles.title}>Baao Community College</Text>
          <Text style={styles.message}>
            Could not connect to the portal at {portalUrl}. Start the backend
            and ensure this device and your computer use the same network.
          </Text>
          <TouchableOpacity style={styles.button} onPress={reload}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL(portalUrl)}
          >
            <Text style={styles.linkText}>Open server address</Text>
          </TouchableOpacity>
        </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator color="#C97B3D" size="large" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: portalUrl }}
        originWhitelist={["http://*", "https://*"]}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onHttpError={(event) => {
          if (event.nativeEvent.statusCode >= 400) {
            setIsLoading(false);
            setHasError(true);
          }
        }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color="#C97B3D" size="large" />
          </View>
        )}
      />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B2740" },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B2740",
    zIndex: 2,
  },
  errorCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  title: { color: "#FFFFFF", fontSize: 24, fontWeight: "700", textAlign: "center" },
  message: {
    color: "#DCE8F2",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#C97B3D",
    borderRadius: 8,
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "700" },
  linkButton: { marginTop: 18, padding: 8 },
  linkText: { color: "#FFFFFF", textDecorationLine: "underline" },
});
