// Web stub for lib/ads.ts. react-native-google-mobile-ads is native-only and
// its module graph pulls in codegenNativeComponent, which Metro cannot bundle
// for web. Metro resolves this `.web.ts` variant on web, so the native package
// is never imported into the web bundle. Keep the exported API in sync with
// lib/ads.ts — both are no-ops on web anyway.

export async function initAds(): Promise<void> {
  // No ads on web.
}

export function showInterstitial(): void {
  // No ads on web.
}
