export interface RobloxFriend {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl: string;
  avatarBg?: string;
  hasBadge?: boolean;
  badgeType?: 'plus' | 'verified' | 'premium';
  isOnline?: boolean;
}

export interface RobuxPackage {
  id: string;
  robuxAmount: number;
  bonusRobux?: number;
  originalRobux?: number;
  priceEur: string;
  popular?: boolean;
}

export interface RobloxPlusOption {
  id: string;
  title: string;
  priceMonth: string;
  originalPriceMonth?: string;
  valueTotal?: string;
  features: string[];
}

export interface LimitedItem {
  id: string;
  title: string;
  seller: string;
  sellerVerified: boolean;
  daysRemaining: number;
  robuxPrice: number;
  originalRobuxPrice: number;
  extraRobux: number;
  euroPrice: string;
  imageUrl: string;
}

export interface UserSettings {
  username: string;
  displayName: string;
  robuxCount: number;
  hasVerifiedBadge: boolean;
  isRobloxPlus: boolean;
  avatarType: string;
  customAvatarUrl?: string;
  unreadMessagesCount: number;
  connectionCount: number;
  theme?: 'light' | 'dark';
  language?: string;
  hasCompletedOnboarding?: boolean;
  limitedItemDays?: number;
}
