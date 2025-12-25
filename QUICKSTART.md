# Quick Start Guide

This guide will help you set up the Blob development environment in just a few minutes.

## Prerequisites

Make sure you have these installed:

1. **Node.js 18+** - JavaScript runtime
   - [Download](https://nodejs.org/) - Get the LTS version
   - Verify: `node --version`
2. **pnpm** - Package manager
   - Install: `npm install -g pnpm`
   - Verify: `pnpm --version`
3. **Git** - Version control
   - [Download](https://git-scm.com/downloads)
   - Verify: `git --version`
4. **Docker** - Database container platform
   - [Download](https://www.docker.com/products/docker-desktop)
   - Verify: `docker --version`
   - **Important**: Make sure Docker Desktop is running!
5. **Expo Go** - For mobile testing (install on your phone)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

**Don't have these?** Check the detailed explanation of each tool in [CONTRIBUTING.md](./CONTRIBUTING.md#what-youll-need-prerequisites).

## Setup (3 steps)

### 1. Clone the repository

```bash
git clone https://github.com/opencodeiiita/blob.git
cd blob
```

### 2. Run the automated setup script

```bash
pnpm setup
```

This interactive script will:

- ✓ Check all prerequisites
- ✓ Install dependencies
- ✓ Create environment files
- ✓ Start Docker containers
- ✓ Set up the database

### 3. Start developing

```bash
pnpm dev
```

Then:

- Install **Expo Go** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Make sure your phone and computer are on the **same Wi-Fi**
- Scan the QR code shown in the terminal

## Platform-Specific Notes

### Windows

- Run commands in PowerShell or Command Prompt
- `pnpm setup` works perfectly in both terminals

### macOS

- If you see permission errors, run: `chmod +x scripts/setup.js`
- Docker Desktop must be running

### Linux

- If you see permission errors, run: `chmod +x scripts/setup.js`
- Docker Desktop or Docker Engine must be running
- You may need to add your user to the docker group: `sudo usermod -aG docker $USER`

## Troubleshooting

### "Cannot connect to Docker daemon"

- Make sure Docker Desktop is running
- On Linux, check: `sudo systemctl status docker`

### "Port already in use"

Check what's using the ports:

**Mac/Linux:**

```bash
lsof -ti:5432 | xargs kill -9  # PostgreSQL
lsof -ti:8787 | xargs kill -9  # API
lsof -ti:8081 | xargs kill -9  # Expo
```

**Windows:**

```cmd
netstat -ano | findstr :5432
taskkill /PID <PID> /F
```

### "Module not found" errors

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Useful Commands

```bash
pnpm dev              # Start both API and mobile
pnpm dev:api          # Start only API
pnpm dev:mobile       # Start only mobile

pnpm docker:up        # Start Docker
pnpm docker:down      # Stop Docker
pnpm docker:logs      # View logs

pnpm db:push          # Update database schema
pnpm db:studio        # Open database GUI

pnpm format           # Format code
pnpm lint             # Lint code
```

## Need Help?

- 📖 Read the full [CONTRIBUTING.md](./CONTRIBUTING.md)
- 🐛 [Open an issue](https://github.com/opencodeiiita/blob/issues)
- 💬 [Join Discord](https://discord.gg/jnHGrDQu)

## What's Next?

Check out:

- [Project Structure](./CONTRIBUTING.md#understanding-the-project-structure)
- [Common Development Tasks](./CONTRIBUTING.md#common-development-tasks)
- [Code Style Guidelines](./CONTRIBUTING.md#code-style-guidelines)

Happy coding!
