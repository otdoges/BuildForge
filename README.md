# BuildBox

BuildBox is a smart AI chat interface with integrated code editing capabilities. It provides a seamless experience for developers to interact with an AI assistant while working on coding tasks.

## Features

- **Smart Chat Interface**: Full-page chat that transitions to split-screen mode when code is detected
- **Code Editor Integration**: Monaco editor for code editing and viewing 
- **Authentication**: Secure user management with Clerk
- **Database Storage**: Data persistence with Supabase
- **Server-First Processing**: Optimized for performance with client fallback
- **Modern UI**: Clean, responsive interface built with Tailwind CSS and Radix UI

## Tech Stack

- **Frontend**: Next.js 15, React 19
- **Authentication**: Clerk
- **Database**: Supabase
- **Styling**: Tailwind CSS, Radix UI components
- **Code Editing**: Monaco Editor
- **AI Integration**: Azure AI and Model Context Protocol

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/buildbox.git
   cd buildbox
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Create a `.env` file based on the `.env.example` file
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables with your own credentials

### Environment Variables

Required environment variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional: Add any other services you're using
```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## Authentication

BuildBox uses Clerk for authentication and user management. The authentication flow includes:

- Sign up/Sign in pages
- User profile management
- Protected routes with middleware

## Database

While Clerk handles authentication, Supabase is used for database operations. The Supabase client is configured not to handle authentication sessions.

## Project Structure

```
buildbox/
├── app/                  # Next.js app router pages
│   ├── api/              # API routes
│   ├── chat/             # Chat interface
│   ├── sign-in/          # Authentication pages
│   └── sign-up/
├── components/           # Reusable UI components
├── lib/                  # Utility functions and shared logic
├── public/               # Static assets
├── styles/               # Global styles
└── ...
```

## License

[MIT License](LICENSE) 