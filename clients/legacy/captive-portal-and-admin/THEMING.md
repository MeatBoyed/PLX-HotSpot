# Brand Theming Guide

This app has been abstracted to use CSS variables for all brand colors, making it easy to reskin for different businesses while maintaining the exact same layout and functionality.

## Quick Start

### Option 1: Update CSS Variables (Recommended)
The easiest way to rebrand the app is to update the CSS variables in `src/app/globals.css`:

```css
:root {
  /* Brand Theme Variables */
  --brand-primary: #301358;        /* Your primary brand color */
  --brand-primary-hover: #5B3393;  /* Hover state for primary color */
  --brand-secondary: #F2F2F2;      /* Secondary/background color */
  --brand-accent: #F60031;         /* Accent color for highlights */
  
  /* Text Colors */
  --text-primary: #181818;         /* Primary text color */
  --text-secondary: #5D5D5D;       /* Secondary text color */
  --text-tertiary: #7A7A7A;        /* Tertiary text color */
  --text-muted: #CECECE;           /* Muted text color */
  
  /* Surface Colors */
  --surface-card: #F2F2F2;         /* Card backgrounds */
  --surface-white: #FFFFFF;        /* White surfaces */
  --surface-border: #CECECE;       /* Border colors */
  
  /* Button Colors */
  --button-primary: var(--brand-primary);
  --button-primary-hover: var(--brand-primary-hover);
  --button-primary-text: var(--surface-white);
  --button-secondary: var(--surface-white);
  --button-secondary-hover: #f5f5f5;
  --button-secondary-text: var(--brand-primary);
}
```

### Option 2: Use JavaScript Theme Switching
For dynamic theme switching, use the theme utilities in `src/lib/theme.ts`:

```typescript
import { applyTheme, exampleBusinessTheme } from '@/lib/theme';

// Apply a different theme
applyTheme(exampleBusinessTheme);
```

### Option 3: Dynamic Brand Images
Each theme can now include brand-specific images:

```typescript
export const myBrandTheme: BrandTheme = {
  name: "My Brand",
  colors: {
    // ... color configuration
  },
  images: {
    logo: "/my-brand-logo.svg",                    // Main logo (dark backgrounds)
    logoWhite: "/my-brand-logo-white.svg",         // White logo (dark backgrounds)
    connectCardBackground: "/my-brand-bg.png",     // Connect card background
    bannerOverlay: "/my-brand-overlay.png",        // Banner overlay image
    favicon: "/my-brand-favicon.svg",              // Browser favicon
  }
};
```

## Using Theme Images in Components

### Method 1: useTheme Hook
```typescript
import { useTheme } from '@/components/theme-provider';

function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <img src={theme.images.logo} alt="Brand logo" />
  );
}
```

### Method 2: useThemeImages Hook (Recommended)
```typescript
import { useThemeImages } from '@/components/use-theme-images';

function MyComponent() {
  const { logo, logoWhite, connectCardBackground } = useThemeImages();
  
  return (
    <img src={logo} alt="Brand logo" />
  );
}
```

## Dark Mode Support

The app also includes dark mode variants. Update the `.dark` section in `globals.css`:

```css
.dark {
  /* Dark mode brand overrides */
  --brand-primary: #5B3393;
  --brand-primary-hover: #301358;
  --brand-secondary: #2a2a2a;
  --surface-card: #2a2a2a;
  --text-primary: #f5f5f5;
  --text-secondary: #d4d4d4;
  --text-tertiary: #a3a3a3;
  --surface-border: #404040;
}
```

## Creating a New Theme

1. **Copy the existing theme structure** from `src/lib/theme.ts`
2. **Update the color values** for your brand
3. **Apply the theme** using `applyTheme()` or by updating CSS variables directly

### Example: Creating a Blue Theme

```typescript
export const blueTheme: BrandTheme = {
  name: "Blue Brand",
  colors: {
    brandPrimary: "#2563eb",      // Blue
    brandPrimaryHover: "#1d4ed8",  
    brandSecondary: "#f8fafc",    
    brandAccent: "#dc2626",       
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
    textTertiary: "#94a3b8",
    textMuted: "#cbd5e1",
    surfaceCard: "#f8fafc",
    surfaceWhite: "#ffffff",
    surfaceBorder: "#cbd5e1",
    buttonPrimary: "#2563eb",
    buttonPrimaryHover: "#1d4ed8",
    buttonPrimaryText: "#ffffff",
    buttonSecondary: "#ffffff",
    buttonSecondaryHover: "#f1f5f9",
    buttonSecondaryText: "#2563eb",
  }
};
```

## Components Updated

All the following components now use CSS variables instead of hardcoded colors:

- ✅ Main page (`src/app/page.tsx`)
- ✅ Welcome page (`src/app/welcome/page.tsx`) 
- ✅ Connect Card (`src/components/home-page/connect-card.tsx`)
- ✅ Plan Card (`src/components/welcome-page/plan-card.tsx`)
- ✅ Current Plan Card (`src/components/welcome-page/current-plan-card.tsx`)
- ✅ User Session (`src/components/welcome-page/user-session.tsx`)
- ✅ Ad Banner (`src/components/home-page/ad-banner.tsx`)
- ✅ Global CSS styles (`src/app/globals.css`)

## Brand Assets

Don't forget to update these assets for complete rebranding:

- Logo files in `/public/` directory
- Favicon and app icons
- Background images
- Any brand-specific graphics

## Using Tailwind Classes

With the updated theme configuration, you can now use Tailwind classes for brand colors:

```tsx
// Background colors
<div className="bg-brand-primary">Primary background</div>
<div className="bg-surface-card">Card background</div>

// Text colors
<p className="text-text-primary">Primary text</p>
<p className="text-text-secondary">Secondary text</p>

// Border colors
<div className="border border-surface-border">Bordered element</div>

// Button styling
<button className="bg-button-primary text-button-primary-text hover:bg-button-primary-hover">
  Primary Button
</button>
```

### Available Tailwind Classes

| Class                      | Description                |
| -------------------------- | -------------------------- |
| `bg-brand-primary`         | Primary brand background   |
| `bg-brand-secondary`       | Secondary brand background |
| `bg-surface-card`          | Card background            |
| `text-text-primary`        | Primary text color         |
| `text-text-secondary`      | Secondary text color       |
| `text-text-tertiary`       | Tertiary text color        |
| `border-surface-border`    | Brand border color         |
| `bg-button-primary`        | Primary button background  |
| `text-button-primary-text` | Primary button text        |

## Color Mapping

Here's what each CSS variable controls:

| Variable                | Used For                             |
| ----------------------- | ------------------------------------ |
| `--brand-primary`       | Main backgrounds, primary buttons    |
| `--brand-primary-hover` | Button hover states                  |
| `--brand-secondary`     | Card backgrounds, secondary elements |
| `--brand-accent`        | Highlights, accent elements          |
| `--text-primary`        | Main headings, primary text          |
| `--text-secondary`      | Secondary text, descriptions         |
| `--text-tertiary`       | Muted text, placeholders             |
| `--surface-card`        | Card and container backgrounds       |
| `--surface-border`      | Borders, dividers                    |

## Testing Your Theme

1. Update the CSS variables in `globals.css`
2. Start the development server: `npm run dev`
3. Check all pages and components for consistent styling
4. Test both light and dark modes
5. Verify button states and interactions work correctly

The layout and functionality will remain exactly the same - only the colors will change!
