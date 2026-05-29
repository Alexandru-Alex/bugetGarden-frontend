import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";

  const androidScheme = `com.googleusercontent.apps.${androidClientId.replace(".apps.googleusercontent.com", "")}`;
  const iosScheme = `com.googleusercontent.apps.${iosClientId.replace(".apps.googleusercontent.com", "")}`;

  return {
    ...config,
    name: "Money Garden",
    slug: "bugetGarden-front",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.jpg",
    scheme: "bugetgardenfront",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.g3d0manz00.bugetGardenfront",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      icon: "./assets/images/icon.jpg",
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.jpg",
        backgroundColor: "#C8E87A",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.g3d0manz00.bugetGardenfront",
      intentFilters: androidScheme
        ? [
            {
              action: "VIEW",
              data: [{ scheme: androidScheme, path: "/oauth2redirect" }],
              category: ["BROWSABLE", "DEFAULT"],
            },
          ]
        : [],
    },
    web: {
      output: "static",
      favicon: "./assets/images/icon.jpg",
      title: "Money Garden - Track, Earn, Grow",
      description:
        "Gamified budget management app. Track expenses, earn gold coins, and grow your virtual garden while building better financial habits.",
      lang: "en",
      themeColor: "#346739",
      backgroundColor: "#ffffff",
    },
    plugins: [
      "expo-router",
      [
        "@react-native-google-signin/google-signin",
        { iosUrlScheme: iosScheme },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.jpg",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" },
        },
      ],
      "expo-secure-store",
      "expo-apple-authentication",
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.jpg",
          color: "#346739",
          androidMode: "default",
        },
      ],
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: "ca-app-pub-6487095991586093~4686511193",
          // iOS not in use yet — Google's public sample app ID keeps iOS builds valid.
          // Replace with a real iOS App ID when an iOS AdMob app exists.
          iosAppId: "ca-app-pub-3940256099942544~1458002511",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "04508f44-0802-4849-b471-3ece1ffea226",
      },
    },
  };
};
