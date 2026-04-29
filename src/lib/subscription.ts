export interface TierConfig {
  name: string;
  product_id: string | null;
  price_id: string | null;
  images: number;
  videos: number;
  history: boolean;
  compare: boolean;
  batch: boolean;
  export: boolean;
  lifetime?: boolean;
}

// Reprompta is fully free — every user gets unlimited access to every feature.
const FREE_UNLIMITED: TierConfig = {
  name: "Free",
  product_id: null,
  price_id: null,
  images: Infinity,
  videos: Infinity,
  history: true,
  compare: true,
  batch: true,
  export: true,
};

export const TIERS: Record<string, TierConfig> = {
  free: FREE_UNLIMITED,
  basic: FREE_UNLIMITED,
  pro: FREE_UNLIMITED,
};

export function getTierByProductId(_productId: string | null): TierConfig {
  return FREE_UNLIMITED;
}

export function getTierKey(_productId: string | null): string {
  return "free";
}

export interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
  paymentFailed: boolean;
}
