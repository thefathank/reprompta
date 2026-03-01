export interface TierConfig {
  name: string;
  product_id: string | null;
  price_id: string | null;
  images: number; // per month, or lifetime for free
  videos: number; // per month
  history: boolean;
  compare: boolean;
  batch: boolean;
  export: boolean;
  lifetime?: boolean; // if true, images count is lifetime not monthly
}

export const TIERS: Record<string, TierConfig> = {
  free: {
    name: "Free",
    product_id: null,
    price_id: null,
    images: 1,
    videos: 0,
    history: false,
    compare: false,
    batch: false,
    export: false,
    lifetime: true,
  },
  basic: {
    name: "Basic",
    product_id: "prod_U4MJwRZbJp7Nid",
    price_id: "price_1T6Db6Dab7guoXOTw2qzpWhg",
    images: 10,
    videos: 1,
    history: true,
    compare: false,
    batch: false,
    export: false,
  },
  pro: {
    name: "Pro",
    product_id: "prod_U4MKifk1TpNOWD",
    price_id: "price_1T6DbSDab7guoXOTqb7hBGFM",
    images: Infinity,
    videos: 5,
    history: true,
    compare: true,
    batch: true,
    export: true,
  },
};

export function getTierByProductId(productId: string | null): TierConfig {
  if (!productId) return TIERS.free;
  const found = Object.values(TIERS).find((t) => t.product_id === productId);
  return found || TIERS.free;
}

export function getTierKey(productId: string | null): string {
  if (!productId) return "free";
  for (const [key, tier] of Object.entries(TIERS)) {
    if (tier.product_id === productId) return key;
  }
  return "free";
}

export interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
}
