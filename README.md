# RegretWallet

A Next.js 15 web application that allows users to place bets with charitable stakes. When you lose a bet, your money automatically goes to a charity of your choice.

## Features

- 🎲 **Bet Creation**: Create meaningful bets with clear outcomes
- 💰 **Escrow System**: Secure payment holding using Stripe
- ❤️ **Charity Donations**: Automatic donations when bets are lost
- 🔐 **Authentication**: Secure authentication via Clerk (email + social login)
- 📊 **Dashboard**: Track your bets and donation history
- 🛡️ **Admin Panel**: Manage bets and charities (admin only)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Clerk account and application
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd RegretWallet
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Set up the database:

Run the SQL schema in your Supabase SQL editor:
```bash
# Copy and paste the contents of supabase/schema.sql into Supabase SQL editor
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
RegretWallet/
├── app/
│   ├── api/              # API routes
│   │   ├── bets/         # Bet-related API endpoints
│   │   └── stripe/       # Stripe webhook handlers
│   ├── admin/            # Admin panel page
│   ├── bets/             # Bet pages (create, details)
│   ├── dashboard/        # User dashboard
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx        # Navigation component
│   └── create-bet-form.tsx
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── stripe.ts         # Stripe utilities
│   └── utils.ts          # Utility functions
├── supabase/
│   └── schema.sql        # Database schema
└── middleware.ts         # Clerk middleware
```

## Key Features Explained

### Bet Creation Flow

1. User creates a bet with title, description, amount, charity, and expected outcome
2. Stripe Payment Intent is created for escrow
3. Bet is stored in Supabase with "pending" status
4. After payment confirmation, bet status changes to "active"
5. When bet is resolved:
   - **Win**: Payment intent is canceled, user gets refund
   - **Loss**: Payment is captured and transferred to charity

### Authentication

Clerk handles all authentication with support for:
- Email/password
- Social login (Google, GitHub, etc.)

Protected routes are automatically secured via middleware.

### Database Schema

- **users**: Links Clerk user IDs to database records
- **charities**: List of available charities
- **bets**: All bet records with status and payment information

## Development Notes

- All components use TailwindCSS for styling
- shadcn/ui components are used for consistent UI
- Server components are used where possible for better performance
- Client components are marked with "use client" directive

## Next Steps

- [ ] Implement bet resolution logic
- [ ] Add charity management in admin panel
- [ ] Set up Stripe Connect for charity payouts
- [ ] Add bet search and filtering
- [ ] Implement email notifications
- [ ] Add bet sharing functionality

## License

MIT

