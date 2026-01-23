# FightReplay AI

Turn your arguments into epic animated battles! Upload screenshots of your conversations and watch AI transform them into entertaining battle replays.

## Features

- **Multi-image Upload**: Upload multiple chat screenshots, even if they're out of order
- **AI-Powered Analysis**: Gemini AI reconstructs the timeline and identifies key arguments
- **Animated Battles**: Watch your argument unfold as an animated 1v1 battle
- **Detailed Analysis**: See who "won" based on communication criteria with explanations
- **Shareable Results**: Download PNG share cards or copy share links
- **Mobile-First Design**: Optimized for mobile with touch-friendly UI

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand + TanStack Query
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: Google Gemini (multimodal)
- **Monetization**: Google AdSense (with CMP)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud account (for Gemini API)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fight-replay-ai.git
cd fight-replay-ai
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and fill in your values:
```bash
cp .env.example .env.local
```

4. Set up your environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# AdSense (optional - for production)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
```

5. Set up Supabase:
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Enable Google Auth in Authentication > Providers
   - Create storage buckets: `uploads`, `assets`, `share-cards`

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (analyze, reconstruct, battle)
│   ├── auth/              # Auth pages and callback
│   └── battle/            # Battle wizard page
├── components/
│   ├── ads/               # Ad components (AdSlot, AdsConsent, AdProvider)
│   ├── battle/            # Battle-related components
│   ├── layout/            # Layout components (LandingPage)
│   ├── ui/                # shadcn/ui components
│   └── wizard/            # Wizard step components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── providers/             # React context providers
├── services/
│   ├── ai/               # AI service integrations
│   ├── assets/           # Asset provider (NanoBanana + fallback)
│   └── supabase/         # Supabase client configurations
├── stores/               # Zustand stores
└── types/                # TypeScript types and Zod schemas
```

## Key Features Implementation

### Upload & Analysis Flow

1. User uploads chat screenshots (supports PNG, JPG, WEBP, HEIC)
2. Images are processed by Gemini Vision to extract messages
3. AI reconstructs the chronological timeline
4. User reviews and confirms the conversation

### Battle System

- Each fighter starts with 100 HP
- Messages are converted to "attacks" with damage values
- Damage is based on:
  - Communication style (logical vs emotional)
  - Escalation/de-escalation
  - Use of evidence
  - Respectful vs disrespectful tone
- Battle plays out with animations

### Analysis Criteria

- Clarity of Communication
- Emotional Control
- Use of Evidence
- Resolution Focus
- Respectful Tone

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxx
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript check
npm run test       # Run Playwright tests
```

## Ad Placements

Strategic ad placements (only shown with user consent):

| Placement | Location | Format |
|-----------|----------|--------|
| landing_below_fold | Landing page, below hero | Responsive |
| review_inline | Review step, end of timeline | Rectangle |
| results_winner | Results, below winner banner | Responsive |
| results_mid | Results, between sections | Rectangle |
| results_bottom | Results, before share buttons | Responsive |
| share_bottom | Public share page | Responsive |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Disclaimer

FightReplay AI is for entertainment purposes only. The analysis and "winner" determination are not professional relationship advice. The app does not store or share your conversation content beyond what's necessary for analysis.

---

Built with Next.js, Supabase, and Gemini AI.
