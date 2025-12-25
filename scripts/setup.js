#!/usr/bin/env node

/**
 * Cross-platform setup script for Blob development environment
 * This script automates the setup process for contributors on any platform
 */

// Suppress Node.js warnings
process.removeAllListeners("warning");
process.on("warning", () => {});

import { execSync } from "child_process";
import { existsSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

// ANSI color codes for cross-platform colored output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

// Check if we're on Windows
const isWindows = process.platform === "win32";

/**
 * Prints a colored message to console
 */
function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Prints a section header
 */
function header(message) {
  console.log("");
  log(`${"=".repeat(60)}`, "cyan");
  log(` ${message}`, "bright");
  log(`${"=".repeat(60)}`, "cyan");
  console.log("");
}

/**
 * Prints a success message with checkmark
 */
function success(message) {
  log(`✓ ${message}`, "green");
}

/**
 * Prints an info message
 */
function info(message) {
  log(`ℹ ${message}`, "blue");
}

/**
 * Prints a warning message
 */
function warn(message) {
  log(`⚠ ${message}`, "yellow");
}

/**
 * Prints an error message
 */
function error(message) {
  log(`✗ ${message}`, "red");
}

/**
 * Executes a command and returns true if successful
 */
function runCommand(command, options = {}) {
  try {
    execSync(command, {
      stdio: options.silent ? "pipe" : "inherit",
      cwd: options.cwd || ROOT_DIR,
      shell: true,
    });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Checks if a command exists on the system
 */
function commandExists(command) {
  try {
    const checkCmd = isWindows ? `where ${command}` : `which ${command}`;
    execSync(checkCmd, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets version of a command
 */
function getVersion(command, args = "--version") {
  try {
    const output = execSync(`${command} ${args}`, {
      stdio: "pipe",
      encoding: "utf-8",
    });
    return output.trim().split("\n")[0];
  } catch {
    return "unknown";
  }
}

/**
 * Prompts user for yes/no input
 */
function askYesNo(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

/**
 * Copies environment file if it doesn't exist
 */
function setupEnvFile(examplePath, targetPath, name) {
  const fullExamplePath = join(ROOT_DIR, examplePath);
  const fullTargetPath = join(ROOT_DIR, targetPath);

  if (existsSync(fullTargetPath)) {
    warn(`${name} already exists, skipping...`);
    return false;
  }

  if (!existsSync(fullExamplePath)) {
    error(`${name} example file not found at ${examplePath}`);
    return false;
  }

  try {
    copyFileSync(fullExamplePath, fullTargetPath);
    success(`Created ${name}`);
    return true;
  } catch (err) {
    error(`Failed to create ${name}: ${err.message}`);
    return false;
  }
}

/**
 * Checks all prerequisites
 */
function checkPrerequisites() {
  header("Checking Prerequisites");

  const requirements = [
    { name: "Node.js", command: "node", minVersion: 18 },
    { name: "pnpm", command: "pnpm" },
    { name: "Git", command: "git" },
    { name: "Docker", command: "docker" },
  ];

  let allFound = true;

  for (const req of requirements) {
    if (commandExists(req.command)) {
      const version = getVersion(req.command);
      success(`${req.name} found: ${version}`);

      // Check Node.js version
      if (req.minVersion && req.command === "node") {
        const versionMatch = version.match(/v?(\d+)/);
        if (versionMatch) {
          const majorVersion = parseInt(versionMatch[1]);
          if (majorVersion < req.minVersion) {
            error(
              `Node.js version ${majorVersion} is below minimum required version ${req.minVersion}`,
            );
            allFound = false;
          }
        }
      }
    } else {
      error(`${req.name} not found`);
      allFound = false;

      // Provide installation instructions
      if (req.command === "pnpm") {
        info("Install pnpm: npm install -g pnpm");
      } else if (req.command === "docker") {
        info("Install Docker: https://www.docker.com/products/docker-desktop");
      }
    }
  }

  // Check if Docker is running
  if (commandExists("docker")) {
    if (runCommand("docker ps", { silent: true })) {
      success("Docker daemon is running");
    } else {
      warn("Docker is installed but not running");
      info("Please start Docker Desktop and run this script again");
    }
  }

  console.log("");
  return allFound;
}

/**
 * Installs dependencies
 */
async function installDependencies() {
  header("Installing Dependencies");

  info("This may take a few minutes...");
  console.log("");

  if (runCommand("pnpm install")) {
    success("Dependencies installed successfully");
    return true;
  } else {
    error("Failed to install dependencies");
    return false;
  }
}

/**
 * Sets up environment files
 */
function setupEnvironment() {
  header("Setting Up Environment Files");

  const files = [
    { example: ".env.example", target: ".env", name: "Root .env file" },
    {
      example: "apps/server/.env.example",
      target: "apps/server/.env",
      name: "Server .env file",
    },
  ];

  let created = 0;
  for (const file of files) {
    if (setupEnvFile(file.example, file.target, file.name)) {
      created++;
    }
  }

  if (created > 0) {
    console.log("");
    info("Environment files created with default values for local development");
    info("If you plan to use Neon Postgres, update DATABASE_URL in .env");
  }

  console.log("");
}

/**
 * Starts Docker containers
 */
async function setupDocker() {
  header("Setting Up Docker Containers");

  if (!commandExists("docker")) {
    warn("Docker not found, skipping container setup");
    info("You can manually start containers later with: pnpm docker:up");
    return;
  }

  // Check if Docker is running
  if (!runCommand("docker ps", { silent: true })) {
    warn("Docker daemon is not running");
    info("Please start Docker Desktop and run: pnpm docker:up");
    return;
  }

  const shouldStart = await askYesNo(
    "Start Docker containers (PostgreSQL) now?",
  );

  if (shouldStart) {
    info("Starting PostgreSQL container...");
    console.log("");

    if (runCommand("pnpm docker:up")) {
      success("Docker containers started successfully");
      console.log("");
      info("Waiting for PostgreSQL to be ready...");

      // Wait for PostgreSQL to be healthy
      let retries = 30;
      let ready = false;

      while (retries > 0 && !ready) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          const output = execSync(
            'docker ps --filter "name=blob-postgres" --filter "health=healthy"',
            {
              stdio: "pipe",
              encoding: "utf-8",
            },
          );

          if (output.includes("blob-postgres")) {
            ready = true;
          }
        } catch {
          // Keep waiting
        }

        retries--;
      }

      if (ready) {
        success("PostgreSQL is ready!");
      } else {
        warn("PostgreSQL might still be starting. Check with: docker ps");
      }
    } else {
      error("Failed to start Docker containers");
      info("You can try manually with: pnpm docker:up");
    }
  } else {
    info("Skipping Docker setup. Start containers later with: pnpm docker:up");
  }

  console.log("");
}

/**
 * Sets up the database schema
 */
async function setupDatabase() {
  header("Setting Up Database Schema");

  // Check if we should proceed with database setup
  const hasDocker = commandExists("docker");
  const dockerRunning = runCommand("docker ps", { silent: true });

  if (!hasDocker || !dockerRunning) {
    warn("Docker is not running. Skipping database setup.");
    info("Start Docker and run: pnpm db:push");
    return;
  }

  // Check if PostgreSQL container is running
  try {
    const output = execSync('docker ps --filter "name=blob-postgres"', {
      stdio: "pipe",
      encoding: "utf-8",
    });

    if (!output.includes("blob-postgres")) {
      warn("PostgreSQL container is not running. Skipping database setup.");
      info("Start the container with: pnpm docker:up");
      info("Then run: pnpm db:push");
      return;
    }
  } catch {
    warn("Could not check PostgreSQL status. Skipping database setup.");
    return;
  }

  const shouldSetup = await askYesNo("Push database schema to PostgreSQL?");

  if (shouldSetup) {
    info("Pushing database schema...");
    console.log("");

    if (runCommand("pnpm db:push")) {
      success("Database schema set up successfully");
    } else {
      error("Failed to set up database schema");
      info("You can try manually with: pnpm db:push");
    }
  } else {
    info("Skipping database setup. Run later with: pnpm db:push");
  }

  console.log("");
}

/**
 * Prints next steps
 */
function printNextSteps() {
  header("Setup Complete!");

  log("Next steps:", "bright");
  console.log("");
  log("1. Start the development servers:", "cyan");
  log(
    "   pnpm dev                    # Start both API and mobile app",
    "yellow",
  );
  log("   pnpm dev:api                # Start only API server", "yellow");
  log("   pnpm dev:mobile             # Start only mobile app", "yellow");
  console.log("");

  log("2. Test on your phone:", "cyan");
  log("   • Install Expo Go app on your phone", "yellow");
  log("   • Make sure your phone and computer are on the same Wi-Fi", "yellow");
  log("   • Scan the QR code shown in the terminal", "yellow");
  console.log("");

  log("3. Useful commands:", "cyan");
  log("   pnpm docker:up              # Start Docker containers", "yellow");
  log("   pnpm docker:down            # Stop Docker containers", "yellow");
  log("   pnpm db:studio              # Open database GUI", "yellow");
  log("   pnpm format                 # Format code", "yellow");
  log("   pnpm lint                   # Lint code", "yellow");
  console.log("");

  log("4. Documentation:", "cyan");
  log("   • README.md                 # Project overview", "yellow");
  log("   • CONTRIBUTING.md           # Contributing guide", "yellow");
  console.log("");

  info("Need help? Check the troubleshooting section in CONTRIBUTING.md");
  console.log("");
  log("Happy coding!", "green");
  console.log("");
}

/**
 * Main setup function
 */
async function main() {
  console.log("");
  log("╔════════════════════════════════════════════════════════════╗", "cyan");
  log("║                                                            ║", "cyan");
  log("║             Blob Development Setup Script                  ║", "cyan");
  log("║                                                            ║", "cyan");
  log("╚════════════════════════════════════════════════════════════╝", "cyan");
  console.log("");

  info(`Platform: ${process.platform}`);
  info(`Node version: ${process.version}`);
  console.log("");

  // Check prerequisites
  const prereqsOk = checkPrerequisites();
  if (!prereqsOk) {
    error("Please install missing prerequisites and run this script again");
    process.exit(1);
  }

  // Setup environment files
  setupEnvironment();

  // Install dependencies
  const depsInstalled = await installDependencies();
  if (!depsInstalled) {
    error("Setup failed during dependency installation");
    process.exit(1);
  }

  // Setup Docker
  await setupDocker();

  // Setup database
  await setupDatabase();

  // Print next steps
  printNextSteps();
}

// Run main function
main().catch((err) => {
  console.error("");
  error(`Setup failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
