# Wearable Health Assistant

A Next.js application that integrates with Oura Ring to provide AI-powered health insights and visualizations using Claude AI.

## Features

- **Oura Integration**: Secure OAuth authentication with Oura Ring
- **Data Sync**: Automatically syncs sleep, activity, and readiness data
- **AI Chatbot**: Natural language interface powered by Anthropic Claude
- **Smart Visualizations**: Auto-generated charts using Vega-Lite
- **Health Insights**: Personalized recommendations based on your data
- **Conversation History**: Maintains context across chat sessions

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes, PostgreSQL
- **AI**: Anthropic Claude 3.5 Sonnet
- **Visualization**: Vega-Lite
- **Authentication**: OAuth 2.0 with Oura
- **Database**: PostgreSQL with pg client

## Project Structure

```
wearable-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── oura/
│   │   │   │   ├── route.ts           # OAuth initiation
│   │   │   │   └── callback/
│   │   │   │       └── route.ts       # OAuth callback handler
│   │   │   └── logout/
│   │   │       └── route.ts           # Logout endpoint
│   │   ├── chat/
│   │   │   └── route.ts               # Chat endpoint with Claude
│   │   └── oura/
│   │       ├── sync/
│   │       │   └── route.ts           # Sync Oura data
│   │       └── data/
│   │           └── route.ts           # Get stored data
│   ├── page.tsx                       # Main page
│   └── layout.tsx                     # Root layout
├── components/
│   ├── ChatInterface.tsx              # Chat UI component
│   ├── VegaChart.tsx                  # Vega-Lite chart renderer
│   ├── LoginButton.tsx                # OAuth login button
│   └── SyncButton.tsx                 # Data sync button
├── lib/
│   ├── db.ts                          # PostgreSQL connection
│   ├── oura.ts                        # Oura API client
│   ├── claude.ts                      # Claude AI client
│   └── auth.ts                        # Auth helpers
├── types/
│   └── oura.ts                        # TypeScript types
└── db/
    ├── migrations/
    │   └── 001_initial_schema.sql     # Database schema
    └── setup.ts                       # Migration runner
```

## Setup Instructions

### Prerequisites

- Node.js v22+
- PostgreSQL 14+
- Oura API credentials
- Anthropic API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd wearable-app
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb wearable_app
```

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/wearable_app
OURA_CLIENT_ID=your_oura_client_id
OURA_CLIENT_SECRET=your_oura_client_secret
OURA_REDIRECT_URI=http://localhost:3000/api/auth/oura/callback
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run Migrations

```bash
npm run db:setup
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Getting API Credentials

### Oura API

1. Go to [Oura Cloud](https://cloud.ouraring.com/oauth/applications)
2. Create a new OAuth application
3. Set redirect URI: `http://localhost:3000/api/auth/oura/callback`
4. Required scopes: `email`, `personal`, `daily`, `heartrate`, `workout`, `session`
5. Copy Client ID and Client Secret

### Anthropic API

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account
3. Generate an API key in the API Keys section

## Usage

1. **Login**: Click "Connect with Oura" on the homepage
2. **Authorize**: Grant permissions to access your Oura data
3. **Sync**: Click "Sync Oura Data" to fetch your health metrics
4. **Chat**: Ask questions about your health data

### Example Questions

- "How has my sleep been this week?"
- "Show me my activity trends for the last month"
- "What's my average readiness score?"
- "Create a chart of my sleep scores over time"
- "What factors are affecting my recovery?"

## How It Works

### Data Flow

1. **Authentication**: OAuth 2.0 flow with Oura
2. **Data Sync**: Fetches last 30 days of data from Oura API
3. **Storage**: Stores data in PostgreSQL with deduplication
4. **Chat**: User asks a question
5. **Context**: Retrieves relevant health data from database
6. **AI Analysis**: Sends data + question to Claude
7. **Response**: Claude generates insights and visualizations
8. **Display**: Renders response with embedded Vega-Lite charts

### Visualization Generation

Claude can generate Vega-Lite specifications in responses. The ChatInterface component:

1. Detects code blocks with `vega-lite` language identifier
2. Extracts and parses the JSON spec
3. Renders the chart using the VegaChart component
4. Displays the explanation alongside the visualization

## Database Schema

- **users**: OAuth tokens and user info
- **daily_sleep**: Sleep scores and contributors
- **daily_activity**: Activity metrics and steps
- **daily_readiness**: Readiness scores and factors
- **chat_history**: Conversation messages

## API Routes

### Authentication
- `GET /api/auth/oura` - Initiate OAuth
- `GET /api/auth/oura/callback` - OAuth callback
- `POST /api/auth/logout` - Logout

### Oura Data
- `POST /api/oura/sync` - Sync data from Oura
- `GET /api/oura/data?days=30&type=all` - Get stored data

### Chat
- `POST /api/chat` - Send message, get AI response
- `GET /api/chat?limit=50` - Get chat history

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:setup     # Run database migrations
```

## Security Considerations

- OAuth state parameter for CSRF protection
- HTTP-only cookies for session management
- Secure token storage in database
- Environment variables for secrets
- Input validation on all endpoints

## Future Enhancements

- Support for Apple Watch data
- Support for other wearables (Fitbit, Garmin, etc.)
- More advanced visualizations
- Trend analysis and predictions
- Exportable health reports
- Mobile app (React Native)
- Real-time data updates via webhooks

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a PR.
