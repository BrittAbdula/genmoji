# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Cloudflare Pages specific commands
pnpm pages:build      # Build for Cloudflare Pages
pnpm pages:deploy     # Deploy to Cloudflare Pages
pnpm pages:watch      # Watch mode for Pages
pnpm pages:dev        # Local Pages development
```

## Architecture Overview

This is a Next.js 15 internationalized (i18n) emoji generation platform that creates Apple-style "genmojis" using AI. The app supports multiple languages and includes user authentication, subscription management, and various emoji tools.

### Key Technologies
- **Next.js 15** with App Router and standalone output
- **next-intl** for internationalization (en, zh, fr, ja)
- **Tailwind CSS** + **Radix UI** components
- **Zustand** for state management
- **TypeScript** throughout
- **Cloudflare Pages** deployment target

### Core Architecture

#### State Management (`src/store/`)
- `auth-store.ts` - User authentication state (Google OAuth)
- `generation-store.ts` - Global emoji generation progress tracking
- `emoji-groups-provider.tsx` - Context for emoji categories/models/colors

#### API Layer (`src/lib/`)
- `api.ts` - Main API functions for emoji operations
- `api-config.ts` - Centralized API endpoint definitions
- All APIs use unified base URL: `https://genmoji-api.genmojionline.com`

#### Routing Structure
```
/[locale]/                    # Internationalized routes
├── (legal)/                  # Legal pages (terms, privacy, refund)
├── emoji/[slug]/             # Individual emoji pages
├── category/[slug]/          # Category browsing
├── color/[slug]/             # Color-based browsing
├── model/[slug]/             # Model-based browsing
├── gallery/                  # Gallery view
├── my-emojis/               # User's generated emojis
├── genmoji-maker/           # Main generation tool
├── sticker-maker/           # Sticker variant
└── mascot-maker/            # Mascot variant
```

#### Key Components

**Generator Components:**
- `unified-genmoji-generator.tsx` - Main generation component with model selection (genmoji/sticker/mascot)
- Supports text prompts and image uploads
- Handles generation limits and subscription checks

**Authentication:**
- Google OAuth integration
- JWT token management
- Mobile-responsive login (Dialog/Drawer pattern)

**Emoji Display:**
- `emoji-container.tsx` - Individual emoji display with actions
- `emoji-grid.tsx` - Grid layouts for listings
- `emoji-variations.tsx` - Related emoji suggestions

### Environment Configuration

Required environment variables:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### API Integration

The app integrates with a unified backend API for:
- Emoji generation (`/genmoji/generate`)
- User authentication (`/auth/*`)
- Emoji management (list, search, categories)
- Subscription handling
- Image uploads

See `API_ROUTES_MAPPING.md` and `USER_AUTH_SETUP.md` for detailed API documentation.

### Internationalization

Uses next-intl with message files in `/messages/`:
- `en.json` (English)
- `zh.json` (Chinese)
- `fr.json` (French)
- `ja.json` (Japanese)

Middleware handles locale detection and routing.

### Responsive Design

Mobile-first approach with:
- Desktop: Dialog modals for interactions
- Mobile: Drawer components for better UX
- Adaptive grid layouts (2 cols mobile → 6 cols desktop)
- Touch-optimized interactions

### Key Features

1. **Multi-model Generation**: genmoji, sticker, mascot variants
2. **Image-to-Emoji**: Upload photos for personalized generation
3. **User Accounts**: Google login with personal emoji collections
4. **Subscription System**: Usage limits and premium features
5. **Universal Compatibility**: Works across all platforms/messaging apps
6. **SEO Optimized**: Dynamic meta tags, sitemaps, structured data

### Testing & Deployment

No specific test commands found - use standard Next.js testing practices.

Deployment targets:
- Primary: Cloudflare Pages (`pnpm pages:build && pnpm pages:deploy`)
- Alternative: Vercel/other platforms (standard Next.js build)

### Development Notes

- Uses `output: 'standalone'` for containerized deployments
- Images configured for `store.genmojionline.com` domain
- Trailing slashes enabled for better SEO
- All external APIs centralized through `/lib/api.ts`
- Consistent error handling with custom `GenerationLimitError` class