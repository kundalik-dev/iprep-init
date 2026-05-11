# iPrep CLI

> Self-hosted interview preparation platform — runs entirely on your local machine.

## Quick Start

```bash
npx iprep onboard --yes
```

That's it. iPrep sets up your environment, initializes the database, starts the local server, and opens the frontend in your browser.

## Installation

```bash
# Run without installing (recommended)
npx iprep <command>

# Or install globally
npm install -g iprep
iprep <command>
```

## Commands

### `iprep onboard`

First-time setup. Run this once after installing.

```bash
iprep onboard          # interactive mode — prompts for port and confirms before proceeding
iprep onboard --yes    # non-interactive mode — uses defaults, no prompts
```

What it does:

1. Checks if `~/.iprep/` already exists
2. Prompts for a server port (default `5545`) and validates it is free
3. Creates `~/.iprep/{database,logs,sessions,exports}/`
4. Writes a `.env` file with port, DB, and CORS config
5. Runs database migrations
6. Verifies the setup (config dir, DB file, DB health)
7. Prints a completion summary

### `iprep start`

Start the iPrep server and open the frontend in your browser.

```bash
iprep start
```

### `iprep status`

Check whether the server is running and the environment is healthy.

```bash
iprep status
```

## How It Works

iPrep is a single npm package that ships a CLI, a local Express server, and a React frontend together. When you run `iprep onboard`, the CLI sets up your local environment. When you run `iprep start`, it spawns the Express server as a background process and opens the frontend at `http://localhost:<port>`.

All your data stays on your machine — no cloud, no accounts, no telemetry.

```
iprep (CLI)
  └── spawns @iprep/server  → Express API on localhost
        └── serves frontend static files
        └── connects to ~/.iprep/database/iprep.db (SQLite)
```

## Requirements

- Node.js 20 or later
- npm / npx

## Data & Storage

All iPrep data lives in `~/.iprep/`:

```
~/.iprep/
  database/    — SQLite database file
  logs/        — server logs
  sessions/    — interview session files
  exports/     — exported reports
```

## License

ISC
