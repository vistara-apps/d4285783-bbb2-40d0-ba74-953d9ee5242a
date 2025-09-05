# EduNiche - Your Academic Co-pilot at the Speed of Web3

EduNiche is a production-ready Base Mini App that connects students with verified peer tutors and curated study resources, fostering academic success through a community-driven platform accessible directly within Farcaster.

## 🚀 Features

### Core Features
- **🎓 Verified Tutor Marketplace** - Browse and book sessions with vetted upperclassmen and peers
- **👥 Niche Course Study Groups** - Create and discover hyper-specific study groups
- **📚 Curated Resource Marketplace** - Upload, share, and sell valuable study materials
- **⭐ Community-Vetted Content** - Community ratings ensure quality and relevance

### Technical Features
- **🔐 Farcaster Authentication** - Seamless login with Farcaster identity
- **💳 USDC Payments** - Native Base blockchain payments for tutoring and resources
- **📱 Base Mini App** - Optimized for Farcaster frames and mobile experience
- **🗄️ Supabase Backend** - Scalable PostgreSQL database with real-time features
- **🎨 Modern UI/UX** - Dark theme with responsive design
- **⚡ Performance Optimized** - React Query caching, lazy loading, and optimizations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Privy (Farcaster integration)
- **Blockchain**: Base (Ethereum L2), USDC payments
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **File Storage**: IPFS via Pinata
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/d4285783-bbb2-40d0-ba74-953d9ee5242a.git
cd d4285783-bbb2-40d0-ba74-953d9ee5242a
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

Fill in the required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Base Network Configuration
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Farcaster Configuration (via Neynar)
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_api_key
NEYNAR_API_SECRET=your_neynar_api_secret

# IPFS Configuration (Pinata)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=EduNiche
```

### 4. Database Setup

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize and start local development:
```bash
supabase init
supabase start
```

3. Apply the schema:
```bash
supabase db reset
```

#### Option B: Manual Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Update your environment variables with the project URL and keys

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── tutors/        # Tutor management
│   │   ├── sessions/      # Tutoring sessions
│   │   ├── groups/        # Study groups
│   │   ├── resources/     # Resource marketplace
│   │   └── payments/      # Payment processing
│   ├── tutors/            # Tutors page
│   ├── groups/            # Study groups page
│   ├── resources/         # Resources marketplace
│   └── dashboard/         # User dashboard
├── components/            # React components
│   ├── features/          # Feature-specific components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── auth.ts            # Authentication logic
│   ├── payments.ts        # Payment processing
│   ├── supabase.ts        # Database client
│   ├── store.ts           # State management
│   └── types.ts           # TypeScript types
├── supabase/              # Database schema and migrations
└── public/                # Static assets
```

## 🔧 Configuration

### Supabase Setup

1. **Create Tables**: Run the SQL schema from `supabase/schema.sql`
2. **Row Level Security**: The schema includes RLS policies for data security
3. **Indexes**: Performance indexes are included for common queries

### Privy Setup

1. Create a Privy app at [privy.io](https://privy.io)
2. Enable Farcaster login method
3. Configure embedded wallets for seamless UX
4. Add your domain to allowed origins

### Base Network

The app is configured for Base mainnet by default. For testing:
- Use Base Sepolia testnet
- Update RPC URLs and contract addresses
- Use testnet USDC contract address

### IPFS/Pinata Setup

1. Create account at [pinata.cloud](https://pinata.cloud)
2. Generate API keys
3. Configure CORS settings for your domain

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

```bash
npm run build
npm run start
```

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📱 Base Mini App Integration

This app is optimized as a Base Mini App for Farcaster:

1. **Frame Optimization**: Responsive design for Farcaster frames
2. **MiniKit Integration**: Uses Coinbase's MiniKit for seamless UX
3. **Wallet Integration**: Embedded wallets for frictionless payments
4. **Social Features**: Native Farcaster identity and social graph

## 🔐 Security Features

- **Row Level Security**: Database-level access control
- **Input Validation**: Zod schemas for API validation
- **Rate Limiting**: Built-in API rate limiting
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure configuration management

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Core Web Vitals**: Optimized for excellent UX
- **Bundle Size**: Optimized with code splitting
- **Caching**: React Query for efficient data fetching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discord**: Join our community Discord for support
- **Email**: Contact support@eduniche.app

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core tutor marketplace
- ✅ Study groups
- ✅ Resource sharing
- ✅ USDC payments

### Phase 2 (Next)
- 🔄 Advanced scheduling system
- 🔄 Video call integration
- 🔄 Mobile app (React Native)
- 🔄 AI-powered tutor matching

### Phase 3 (Future)
- 📋 Institutional partnerships
- 📋 Advanced analytics
- 📋 Gamification features
- 📋 Multi-chain support

## 🙏 Acknowledgments

- **Base**: For the excellent L2 infrastructure
- **Farcaster**: For the social protocol and community
- **Supabase**: For the backend-as-a-service platform
- **Privy**: For seamless Web3 authentication
- **Coinbase**: For MiniKit and onchain tools

---

Built with ❤️ for the Web3 education community
