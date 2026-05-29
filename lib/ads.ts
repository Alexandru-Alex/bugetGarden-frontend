import { Platform } from "react-native";
import mobileAds, {
  AdEventType,
  AdsConsent,
  InterstitialAd,
  MaxAdContentRating,
  TestIds,
} from "react-native-google-mobile-ads";

// Real interstitial unit only in production. In dev/Expo Go-like builds we MUST
// use Google's test ID — clicking your own live ad gets the AdMob account banned.
const INTERSTITIAL_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-6487095991586093/7157697648";

const FREQUENCY_CAP_MS = 5 * 60 * 1000; // max 1 interstitial / 5 min

const isWeb = Platform.OS === "web";

// Module-level state survives component re-mounts (same pattern as _lastSync).
let _interstitial: InterstitialAd | null = null;
let _loaded = false;
let _lastShown = 0;
let _adsReady = false; // SDK initialized + consent allows requests

/** Build a fresh interstitial and wire up load/close/error listeners. */
function createInterstitial(): InterstitialAd {
  const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID, {
    requestNonPersonalizedAdsOnly: false,
  });

  ad.addAdEventListener(AdEventType.LOADED, () => {
    _loaded = true;
  });

  // After the user dismisses the ad, preload the next one.
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    _loaded = false;
    preloadInterstitial();
  });

  ad.addAdEventListener(AdEventType.ERROR, () => {
    _loaded = false;
  });

  return ad;
}

function preloadInterstitial() {
  if (isWeb || !_adsReady) return;
  _interstitial = createInterstitial();
  _loaded = false;
  try {
    _interstitial.load();
  } catch {
    // network/no-fill — stays unloaded, retried on next CLOSED/preload
  }
}

/**
 * Initialize the Mobile Ads SDK once at app startup. Runs the UMP consent flow
 * first (GDPR/EEA), then initializes and preloads the first interstitial.
 * No-op on web.
 */
export async function initAds(): Promise<void> {
  if (isWeb || _adsReady) return;

  try {
    // 1. Request the latest consent info and show the form if required.
    await AdsConsent.requestInfoUpdate();
    const { canRequestAds } = await AdsConsent.loadAndShowConsentFormIfRequired();
    if (!canRequestAds) return; // user must consent before we may request ads
  } catch {
    // Consent failure shouldn't crash startup; skip ads this session.
    return;
  }

  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
    });
    await mobileAds().initialize();
    _adsReady = true;
    preloadInterstitial();
  } catch {
    _adsReady = false;
  }
}

/**
 * Show the interstitial if one is loaded and the 5-minute cap has elapsed.
 * Silently skips otherwise (not loaded, capped, web). Safe to call anywhere.
 */
export function showInterstitial(): void {
  if (isWeb || !_adsReady || !_loaded || !_interstitial) return;
  if (Date.now() - _lastShown < FREQUENCY_CAP_MS) return;

  _lastShown = Date.now();
  try {
    _interstitial.show();
  } catch {
    _loaded = false;
    preloadInterstitial();
  }
}
