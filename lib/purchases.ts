import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  Offerings,
  PurchasesPackage,
} from "react-native-purchases";
import { Platform } from "react-native";

export const COIN_PACKAGE_IDS = {
  COINS_1000: "coins_1000",
  COINS_500:  "coins_500",
  COINS_250:  "coinse_250",
} as const;

const RC_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY ?? "";

export function configureRevenueCat(appUserId?: string): void {
  if (Platform.OS === "web") return;
  if (!RC_API_KEY) {
    console.warn("[RevenueCat] EXPO_PUBLIC_REVENUECAT_KEY is not set");
    return;
  }

  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);

  Purchases.configure({
    apiKey:    RC_API_KEY,
    appUserID: appUserId ?? null,
  });
}

export async function rcLogIn(userId: string): Promise<void> {
  if (Platform.OS === "web") return;
  await Purchases.logIn(userId);
}

export async function rcLogOut(): Promise<void> {
  if (Platform.OS === "web") return;
  await Purchases.logOut();
}

export async function getOfferings(): Promise<Offerings> {
  return Purchases.getOfferings();
}

export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export function isCancelledError(e: unknown): boolean {
  return e != null && typeof e === "object" && (e as any).userCancelled === true;
}
