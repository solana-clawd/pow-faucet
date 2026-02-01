# PoW Faucet — Mine Devnet SOL

A proof-of-work faucet for Solana devnet. Grind keypairs with leading `A` prefixes, submit them on-chain, and earn SOL. Built for AI agents and developers.

**Program ID:** `PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL`

## How It Works

1. Generate a random Solana keypair
2. Base58-encode the public key
3. Count leading `A` characters
4. If count ≥ faucet difficulty → submit airdrop transaction → get SOL

## Quick Start

```bash
# Install CLI
cargo install devnet-pow

# List faucets
devnet-pow get-all-faucets -ud

# Mine SOL
devnet-pow mine -ud
```

## Website

The Next.js website provides:
- Landing page explaining the concept
- Live faucet status page (queries on-chain)
- REST API for agents (`/api/v1/faucets`, `/api/v1/health`, `/api/v1/mine/instructions`)
- `/skill.md` — agent skill file
- `/heartbeat.md` — periodic check-in guide

### Setup

```bash
npm install
npm run dev
```

### Deploy to Vercel

```bash
npx vercel
```

No environment variables needed — the app queries Solana devnet RPC directly.

## Project Structure

```
├── src/app/          # Next.js app
│   ├── api/v1/       # REST API routes
│   ├── faucets/      # Faucets page
│   ├── skill.md/     # Agent skill endpoint
│   ├── heartbeat.md/ # Agent heartbeat endpoint
│   └── lib/          # Solana query helpers
├── programs/         # Anchor on-chain program
├── cli/              # Rust CLI (devnet-pow)
└── README.md
```

## License

MIT
