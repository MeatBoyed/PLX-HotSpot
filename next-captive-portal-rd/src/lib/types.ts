export interface GatewayConfig {
  loginUrl: string;
  freeUsername: string;
  freePassword: string;
}

export interface AuthProfile {
  profileId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string | null;
  status: 'Active' | 'Suspended';
  roles: string[];
  siteIds: string[];
}

export interface VastAdData {
    mediaFileUrl: string;
    clickThroughUrl?: string;
    impressionUrls: string[];
    duration?: number;
    title?: string;
    adId?: string;
    trackingEvents?: Record<string, string[]>;
}

export interface BrandingConfig {
    id?: number;
    ssid: string;
    name: string;
    brandPrimary: string;
    brandPrimaryHover: string;
    brandSecondary: string;
    brandAccent: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textMuted: string;
    surfaceCard: string;
    surfaceWhite: string;
    surfaceBorder: string;
    buttonPrimary: string;
    buttonPrimaryHover: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryHover: string;
    buttonSecondaryText: string;
    logo?: string | null;
    logoWhite?: string | null;
    connectCardBackground?: string | null;
    bannerOverlay?: string | null;
    favicon?: string | null;
    adsEnabled?: boolean;
    adsReviveServerUrl?: string | null;
    adsZoneId?: string | null;
    adsReviveId?: string | null;
    adsVastUrl?: string | null;
    termsLinks?: string | null;
    heading?: string | null;
    subheading?: string | null;
    buttonText?: string | null;
    splashBackground?: string | null;
    splashHeading?: string | null;
    authMethods: ('free' | 'voucher' | 'pu-login' | 'pu-phonename')[];
    marketingOptIn?: boolean;
    parentSsid?: string | null;
    venueLabel?: string | null;
    venueRoute?: string | null;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export type BrandingConfigUpdateBody = Partial<Omit<BrandingConfig, 'id' | 'ssid' | 'createdAt' | 'updatedAt'>>;

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: 'TopUp' | 'PackagePurchase' | 'Refund';
  amount: number;
  currency: string;
  status: 'Pending' | 'Completed' | 'Failed';
  reference: string;
  createdAt: string;
  updatedAt: string;
  payFastPaymentId: string | null;
  amountFee: number | null;
  amountNet: number | null;
}

export interface ActivePackage {
  id: string;
  packageName: string;
  purchasedAt: string;
  expiresAt: string | null;
  status: 'Active' | 'Expired' | 'Pending';
}

// Form field configuration type
export type FormFieldConfig = {
    name: string;
    label: string;
    type: "text" | "email" | "number" | "textarea" | "select" | "multiselect" | "checkbox" | "radio" | "time" | "color" | "hidden";
    placeholder?: string;
    description?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    step?: string;
    min?: number;
    max?: number;
};

// Form section configuration
export type FormSectionConfig = {
    title: string;
    description: string;
    fields: FormFieldConfig[];
};