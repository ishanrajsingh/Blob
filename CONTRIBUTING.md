# Contributing to Blob

Thank you for your interest in contributing to Blob! This guide will help you get started, even if you're new to open source or programming.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Running the Project Locally](#running-the-project-locally)
- [Making Changes](#making-changes)
- [Submitting Your Contribution](#submitting-your-contribution)
- [Code Style Guidelines](#code-style-guidelines)
- [Troubleshooting](#troubleshooting)
- [Getting Help](#getting-help)

## Getting Started

### What You'll Need (Prerequisites)

Before you start, make sure you have these essential tools installed on your system:

#### 1. Git (Version Control System)

- **What it does**: Tracks code changes and manages different versions of your code
- **Why you need it**: To clone the repository and submit your contributions
- **Download**: [git-scm.com/downloads](https://git-scm.com/downloads)
- **Verify installation**: Run `git --version` in your terminal
- **Expected output**: `git version 2.x.x` or higher

#### 2. Node.js (JavaScript Runtime)

- **What it does**: Executes JavaScript code outside the browser
- **Why you need it**: Powers the API server, build tools, and all development scripts
- **Minimum version required**: 18 or higher
- **Download**: [nodejs.org](https://nodejs.org/) - Get the **LTS (Long Term Support)** version
- **Verify installation**: Run `node --version` in your terminal
- **Expected output**: `v18.x.x` or higher

#### 3. pnpm (Package Manager)

- **What it does**: Installs and manages JavaScript packages/dependencies
- **Why you need it**: This project uses pnpm for efficient monorepo workspace management
- **Minimum version required**: 8 or higher
- **Install**: Run `npm install -g pnpm` (after installing Node.js)
- **Verify installation**: Run `pnpm --version` in your terminal
- **Expected output**: `8.x.x` or `9.x.x`
- **Why pnpm and not npm?**: Faster installs, better disk space usage, and monorepo support

#### 4. Docker (Container Platform)

- **What it does**: Runs applications in isolated containers
- **Why you need it**: Provides a local PostgreSQL database for development
- **Download**: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Verify installation**: Run `docker --version` in your terminal
- **Expected output**: `Docker version 20.x.x` or higher
- **IMPORTANT**: Make sure Docker Desktop is **running** (not just installed) before starting development
- **How to check**: Run `docker ps` - should not show "Cannot connect to Docker daemon"

#### 5. Expo Go (Mobile Testing App)

- **What it does**: Allows you to test the mobile app on your actual phone
- **Why you need it**: To see your changes in real-time on a mobile device
- **Download**:
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **Install this on your phone**, not your computer!
- **Alternative**: You can use Android Studio Emulator or iOS Simulator (Mac only) instead

#### 6. Code Editor (Your Choice)

- **What it does**: Where you'll write and edit code
- **Recommendations**:
  - **Neovim**: [neovim.io](https://neovim.io/) - Lightweight, powerful, makes you look cool
  - **VS Code**: [code.visualstudio.com](https://code.visualstudio.com/) - Beginner-friendly, feature-rich
  - **Any editor you prefer** works fine!

### Optional Tools

- **GitHub Desktop**: If you prefer a GUI for Git instead of command line - [desktop.github.com](https://desktop.github.com/)
- **Bun Runtime**: Alternative to Node.js for production builds - [bun.sh](https://bun.sh/) (optional, only needed for production deployment)
- **Android Studio**: For Android emulator - [developer.android.com/studio](https://developer.android.com/studio)
- **Xcode**: For iOS simulator (Mac only) - Available on Mac App Store

### Quick Prerequisites Check

Run these commands to verify everything is installed correctly:

```bash
# Check Node.js (should show v18 or higher)
node --version

# Check pnpm (should show 8.x or higher)
pnpm --version

# Check Git
git --version

# Check Docker (should show version number)
docker --version

# Check if Docker is running (should list containers or show empty list)
docker ps
```

If any command fails or shows a lower version, install or update that tool before proceeding.

## Development Environment Setup

### Step 1: Fork and Clone the Repository

1. **Fork the repository**
   - Go to https://github.com/opencodeiiita/blob
   - Click the "Fork" button in the top right
   - This creates a copy of the project in your GitHub account

2. **Clone your fork**
   ```bash
   git clone https://github.com/opencodeiiita/blob.git
   cd blob
   ```

### Step 2: Run the Automated Setup Script (Recommended)

We provide an automated setup script that handles the entire development environment setup for you:

```bash
pnpm setup
```

This script will:

- Check all prerequisites (Node.js, pnpm, Docker, Git)
- Install all dependencies
- Create environment files (.env and .dev.vars)
- Start Docker containers (PostgreSQL)
- Set up the database schema

The script is fully interactive and cross-platform (Windows, macOS, Linux).

**Alternatively, you can follow the manual setup steps below:**

### Step 2 (Manual): Install Dependencies

```bash
pnpm install
```

This command will install all the necessary packages for the project. It might take a few minutes.

### Step 3 (Manual): Set Up Environment Variables

#### For the Root Project

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file. For local development with Docker, use:

```env
# Database (local development with Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blob

# For production with Neon Postgres, replace with your Neon connection string:
# DATABASE_URL=postgresql://user:password@host/database
```

#### For the API (Cloudflare Workers)

Create a `.env` file in the `apps/server` directory:

```bash
cd apps/server
cp .env.example .env
```

The `.env` file should contain the same database URL:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blob
```

**Note**: You don't need to sign up for Neon Postgres for local development! We'll use Docker instead (see next step).

### Step 4: Start the Local Database

Start the PostgreSQL database using Docker:

```bash
pnpm docker:up
```

This command will:

- Download the PostgreSQL Docker image (first time only)
- Start a local PostgreSQL database on port 5432
- Create a database named `blob`

To check if the database is running:

```bash
docker ps
```

You should see a container named `blob-postgres` running.

**Useful Docker commands:**

```bash
# Stop the database
pnpm docker:down

# View database logs
pnpm docker:logs

# Restart the database
pnpm docker:restart
```

### Step 5: Set Up the Database Schema

Push the database schema to your local database:

```bash
pnpm db:push
```

This creates all the necessary tables in your PostgreSQL database.

**Other useful database commands:**

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Step 6: Configure Your Firewall

**IMPORTANT**: You need to allow these ports through your firewall for the app to work:

- **Port 5432** - PostgreSQL database (if accessing from other machines)
- **Port 8081** - Expo development server
- **Port 8787** - API server (Hono/Cloudflare Workers)

#### Windows Firewall

1. Open "Windows Defender Firewall"
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Enter "5432, 8081, 8787" → Next
6. Select "Allow the connection" → Next
7. Check all network types → Next
8. Name it "Blob Development" → Finish

#### macOS Firewall

macOS typically allows local network connections by default. If you have issues:

1. Go to System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Ensure Node, Expo, and Docker are allowed

#### Linux (ufw)

```bash
sudo ufw allow 5432
sudo ufw allow 8081
sudo ufw allow 8787
```

#### Linux (firewalld)

```bash
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --permanent --add-port=8787/tcp
sudo firewall-cmd --reload
```

### Step 6: Configure Your Firewall

## Running the Project Locally

You'll need to run both the API server and the mobile app at the same time. Turbo handles it for you, say thanks to turbo:

```bash
pnpm dev
```

This will start:

- **API Server** on `http://0.0.0.0:8787` (Node.js runtime with hot reload)
- **Mobile App** with Expo development server

### About API Runtimes

The API server uses **different runtimes for different environments**:

- **Development**: Node.js with tsx (hot reload, better debugging, familiar tooling)
- **Production**: Bun (faster startup, native performance, optimized for production)

The server automatically detects which runtime it's running on and adapts accordingly. You don't need to do anything special - just run `pnpm dev` for development!

**Why different runtimes?**

- Node.js is better for development (mature tooling, extensive debugging support)
- Bun is better for production (faster execution, lower memory usage)

### Testing on Your Phone

1. Open **Expo Go** app on your phone
2. Make sure your phone is on the **same Wi-Fi network** as your computer
3. Scan the QR code:
   - **iOS**: Use the Camera app
   - **Android**: Use the Expo Go app to scan

The app should load on your phone! Any changes you make to the code will automatically reload.

### Testing on Emulator/Simulator

If you prefer to use an emulator instead of your phone:

**Android Emulator:**

```bash
# In the mobile terminal, press 'a'
```

**iOS Simulator (Mac only):**

```bash
# In the mobile terminal, press 'i'
```

## Making Changes

### Understanding the Project Structure

```
blob/
├── apps/
│   ├── server/                 # Backend API server
│   │   ├── src/
│   │       └── index.ts    # Main API entry point
│   │
│   └── mobile/             # Mobile app
│       ├── app/            # App screens (file-based routing)
│       ├── components/     # Reusable UI components
│       ├── providers/      # React context providers
│       ├── store/          # State management (Zustand)
│       └── utils/          # Helper functions
│
├── packages/
│   ├── db/                # Database package (Drizzle ORM)
│   │   ├── src/
│   │   │   ├── schema/    # Database schema definitions
│   │   │   └── index.ts   # Database client
│   │   └── drizzle.config.ts
│   │
│   └── api/              # Shared API types and router
│       ├── src/
│       │   ├── routers/   # API route definitions
│       │   ├── server.ts  # tRPC server setup
│       │   └── client.ts  # tRPC client setup
│
├── docker-compose.yml     # Local database configuration
└── docs/                  # Documentation
```

### Common Development Tasks

#### Adding a New API Endpoint

1. Open `packages/api/src/routers/index.ts`
2. Add your new route:

```typescript
export const appRouter = router({
  // Existing routes...

  // Your new route
  createFlashcard: publicProcedure
    .input(
      z.object({
        topic: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // Your logic here
      return { success: true, id: "123" };
    }),
});
```

3. The route is now available in the mobile app automatically!

#### Using the New API in the Mobile App

```typescript
import { trpc } from '@/providers/trpc';

export default function MyScreen() {
  const createFlashcard = trpc.createFlashcard.useMutation();

  const handleCreate = async () => {
    const result = await createFlashcard.mutateAsync({
      topic: 'Math',
      content: 'What is 2+2?',
    });
    console.log(result);
  };

  return (
    <Button onPress={handleCreate}>
      Create Flashcard
    </Button>
  );
}
```

#### Adding a New Screen

1. Create a new file in `apps/mobile/app/`:

   ```typescript
   // apps/mobile/app/flashcards.tsx
   import { View, Text } from 'react-native';

   export default function FlashcardsScreen() {
     return (
       <View>
         <Text>Flashcards</Text>
       </View>
     );
   }
   ```

2. Navigate to it from another screen:

   ```typescript
   import { router } from 'expo-router';

   <Button onPress={() => router.push('/flashcards')}>
     Go to Flashcards
   </Button>
   ```

#### Adding a New Component

Create components in `apps/mobile/components/`:

```typescript
// apps/mobile/components/FlashCard.tsx
import { View, Text } from 'react-native';

interface FlashCardProps {
  question: string;
  answer: string;
}

export function FlashCard({ question, answer }: FlashCardProps) {
  return (
    <View>
      <Text>{question}</Text>
      <Text>{answer}</Text>
    </View>
  );
}
```

#### Database Changes

1. Edit your schema in `packages/db/src/schema/` (e.g., create a new file for your table)

   ```typescript
   // packages/db/src/schema/flashcards.ts
   import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

   export const flashcards = pgTable("flashcards", {
     id: uuid("id").defaultRandom().primaryKey(),
     question: text("question").notNull(),
     answer: text("answer").notNull(),
     createdAt: timestamp("created_at").defaultNow().notNull(),
   });
   ```

2. Export the schema in `packages/db/src/schema/index.ts`:

   ```typescript
   export * from "./users";
   export * from "./flashcards";
   ```

3. Push the changes to your database:
   ```bash
   pnpm db:push
   ```

**Using the database in your code:**

```typescript
import { db } from "@repo/db";
import { flashcards } from "@repo/db/schema";

// Insert a flashcard
await db.insert(flashcards).values({
  question: "What is 2+2?",
  answer: "4",
});

// Query flashcards
const allCards = await db.select().from(flashcards);
```

## Submitting Your Contribution

### Step 1: Create a Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

- `feature/` - New features (e.g., `feature/add-flashcards`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `docs/` - Documentation changes (e.g., `docs/update-readme`)

### Step 2: Make Your Changes

- Write clean, readable code
- Test your changes thoroughly
- Follow the code style guidelines below

### Step 3: Commit Your Changes

```bash
git add .
git commit -m "Add flashcard generation feature"
```

Commit message guidelines:

- Use present tense ("Add feature" not "Added feature")
- Be descriptive but concise
- Start with a verb (Add, Fix, Update, Remove, etc.)

Good examples:

- "Add flashcard generation with AI"
- "Fix login button not responding"
- "Update README with setup instructions"

### Step 4: Push Your Changes

```bash
git push origin feature/your-feature-name
```

### Step 5: Create a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template:
   - Describe what changes you made
   - Explain why you made them
   - Add screenshots if you changed the UI

4. Make sure to add the issue number by adding `issue: #<issue-number>`, real world doesn't work that way it's just opencode's protocols for points distribution.
5. Create pull request

### Step 6: Code Review

- A maintainer will review your code
- They might suggest changes
- Make any requested changes and push them to your branch
- Once approved, your code will be merged!

## Code Style Guidelines

### General Principles

- **Be consistent** - Follow the existing code style
- **Be clear** - Use descriptive variable and function names
- **Be simple** - Don't over-complicate things
- **Comment when necessary** - Explain "why", not "what"

### TypeScript

```typescript
// Good: Descriptive names, proper types
interface FlashcardData {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
}

async function generateFlashcard(topic: string): Promise<FlashcardData> {
  // Implementation
}

// Bad: Unclear names, missing types
function gen(t: any): any {
  // Implementation
}
```

### React Components

```typescript
// Good: Props interface, functional component
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function Button({ title, onPress, disabled = false }: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </Pressable>
  );
}

// Bad: No types, unclear purpose
export function Btn(props: any) {
  return <Pressable onPress={props.p}><Text>{props.t}</Text></Pressable>;
}
```

### Naming Conventions

- **Variables & Functions**: `camelCase` (e.g., `generateFlashcard`)
- **Components**: `PascalCase` (e.g., `FlashCard`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FLASHCARDS`)
- **Files**: Match the export (e.g., `FlashCard.tsx` for `FlashCard` component)

### File Organization

```typescript
// 1. Imports - external first, then internal
import React from 'react';
import { View, Text } from 'react-native';

import { Button } from '@/components/Button';
import { trpc } from '@/providers/trpc';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
}

// 3. Component
export function MyComponent({ title }: MyComponentProps) {
  // 4. Hooks
  const [state, setState] = React.useState('');

  // 5. Event handlers
  const handlePress = () => {
    setState('pressed');
  };

  // 6. Render
  return (
    <View>
      <Text>{title}</Text>
      <Button onPress={handlePress} />
    </View>
  );
}
```

### Formatting

We use Prettier for code formatting. It runs automatically before commits.

To format manually:

```bash
pnpm format
```

To check formatting:

```bash
pnpm format:check
```

## Troubleshooting

### Common Issues

#### "Cannot connect to API"

1. Make sure the API server is running (`cd apps/server && pnpm dev`)
2. Check that ports 8081 and 8787 are open in your firewall
3. Ensure your phone and computer are on the same Wi-Fi network
4. Try restarting both servers

#### "Module not found" Error

```bash
# Clear all caches and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm pnpm-lock.yaml
pnpm install
```

#### Expo Go App Won't Load

1. Make sure you're on the same Wi-Fi network
2. Try scanning the QR code again
3. Check if your firewall is blocking the connection
4. Restart the Expo development server (press `r` in the terminal)
5. Contact `@07calc`

#### Database Connection Error

1. Make sure Docker is running: `docker ps`
2. Check if the database container is up: `pnpm docker:logs`
3. Verify your `DATABASE_URL` in the root `.env` file
4. Restart the database: `pnpm docker:restart`
5. Try running migrations again: `pnpm db:push`

**If using Neon Postgres (production):**

1. Check your `DATABASE_URL` connection string
2. Make sure your Neon database is running
3. Verify network connectivity to Neon

#### TypeScript Errors

```bash
# Rebuild types
cd packages/api
pnpm build
```

#### Port Already in Use

If you see "port 8787 already in use":

```bash
# Find and kill the process (Mac/Linux)
lsof -ti:8787 | xargs kill -9

# Windows
netstat -ano | findstr :8787
taskkill /PID <PID> /F
```

### Getting Debug Information

If you're stuck, gather this information when asking for help:

```bash
# System info
node --version
pnpm --version
git --version

# Error logs
cd apps/server
pnpm dev > server-error.log 2>&1

cd apps/mobile
pnpm start > mobile-error.log 2>&1
```

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/opencodeiiita/blob/discussions)
- **Found a bug?** Open an [Issue](https://github.com/opencodeiiita/blob/issues)
- **Want to chat?** Join [opencodeiiita community](https://discord.gg/jnHGrDQu)

## Code of Conduct

Be kind, respectful, and inclusive. We're all here to learn and build something great together.

## Contributors

Thank you to all our contributors!

## License

By contributing to Blob, you agree that your contributions will be licensed under the MIT License.

---

**Happy coding!** Remember, everyone was a beginner once. Don't be afraid to ask questions or make mistakes - that's how we all learn!
