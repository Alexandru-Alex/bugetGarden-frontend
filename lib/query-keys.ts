export const ACCOUNT_QUERY_KEY = ["account"] as const;

export interface AccountDto {
  email: string;
  displayName: string;
  goldCoins: number;
  totalScore: number;
  currency: string;
  numberOfDecimals?: number;
  avatarUrl?: string;
  provider: string;
  notification?: boolean;
}
