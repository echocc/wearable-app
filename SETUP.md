# Wearable App - Setup Guide

This is a health chatbot application that integrates with Oura Ring data to provide personalized health insights and visualizations powered by Claude AI.

## Prerequisites

- Node.js (v22 or higher)
- PostgreSQL (v14 or higher)
- Oura API credentials
- Anthropic API key

## Setup Steps

### 1. Database Setup

First, create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE wearable_app;

# Create user (optional)
CREATE USER wearable_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE wearable_app TO wearable_user;
```

### 2. Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/wearable_app

# Oura API (Get from https://cloud.ouraring.com/oauth/applications)
OURA_CLIENT_ID=your_oura_client_id
OURA_CLIENT_SECRET=your_oura_client_secret
OURA_REDIRECT_URI=http://localhost:3000/api/auth/oura/callback

# Anthropic Claude API (Get from https://console.anthropic.com/)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Next.js
NEXTAUTH_SECRET=generate_a_random_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run Database Migrations

```bash
npm run db:setup
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Getting API Credentials

### Oura API

1. Visit [Oura Cloud](https://cloud.ouraring.com/oauth/applications)
2. Create a new OAuth application
3. Set redirect URI to `http://localhost:3000/api/auth/oura/callback`
4. Copy the Client ID and Client Secret
5. Request scopes: `email`, `personal`, `daily`, `heartrate`, `workout`, `session`

### Anthropic API

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Generate a new API key

## Project Structure

```
wearable-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # OAuth endpoints
│   │   ├── chat/          # Chatbot endpoint
│   │   └── oura/          # Oura data endpoints
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── db.ts             # Database connection
│   ├── oura.ts           # Oura API client
│   └── claude.ts         # Claude AI client
├── types/                # TypeScript type definitions
├── db/                   # Database files
│   ├── migrations/       # SQL migration files
│   └── setup.ts          # Migration runner
└── public/               # Static assets
```

## Features

- **OAuth Authentication**: Secure login with Oura Ring
- **Data Sync**: Automatic syncing of sleep, activity, and readiness data
- **AI Chatbot**: Ask questions about your health data
- **Visualizations**: Interactive charts using Vega-Lite
- **Insights**: AI-powered health insights and recommendations

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run db:setup` - Run database migrations
