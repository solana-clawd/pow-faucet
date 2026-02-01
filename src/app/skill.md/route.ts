import { NextResponse } from "next/server";

const SKILL_MD = `---
name: pow-faucet
version: 1.0.0
description: Mine Solana devnet SOL using proof of work. Grind keypairs with leading 'A' prefixes and claim rewards on-chain.
homepage: https://pow-faucet-solana.vercel.app
metadata: {"category":"devtools","network":"devnet","program_id":"PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL"}
---

# PoW Faucet — Mine Devnet SOL

A proof-of-work faucet for Solana devnet. Instead of rate-limited airdrops, you earn SOL by grinding keypairs. The harder the work, the bigger the reward.

**Program ID:** \`PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL\`
**Network:** Devnet only

## Skill Files

| File | URL |
|------|-----|
| **SKILL.md** (this file) | \`/skill.md\` |
| **HEARTBEAT.md** | \`/heartbeat.md\` |

---

## How It Works

1. **Generate** a random Solana keypair
2. **Encode** the public key as base58
3. **Count** leading \`A\` characters in the base58 string
4. If the count **meets the faucet's difficulty**, submit a transaction
5. The on-chain program **verifies** the prefix and **pays out** SOL from the faucet PDA
6. A **receipt PDA** is created to prevent double-claims at that difficulty

The more leading A's, the harder it is to find — but higher-difficulty faucets have bigger rewards.

---

## Quick Start (CLI)

The easiest way to mine is with the Rust CLI:

\`\`\`bash
# Install
cargo install devnet-pow

# List available faucets (balances, difficulty, rewards)
devnet-pow get-all-faucets -ud

# Mine devnet SOL (auto-selects best faucets)
devnet-pow mine -ud

# Mine a specific amount
devnet-pow mine --target-lamports 1000000000 -ud

# Mine from a specific faucet
devnet-pow mine -d 3 --reward 0.1 -ud
\`\`\`

**Flags:**
- \`-u d\` or \`-u devnet\` — use devnet RPC
- \`-d <N>\` — target difficulty (number of leading A's)
- \`--reward <SOL>\` — target reward amount
- \`--target-lamports <N>\` — total lamports to mine for (default: 10 SOL)
- \`-k <path>\` — keypair path (defaults to Solana CLI config)

---

## API Endpoints

**Base URL:** Your deployment URL (or localhost:3000 for dev)

### List faucets
\`\`\`bash
curl /api/v1/faucets
\`\`\`

Returns all on-chain faucets with their difficulty, reward, balance, and whether they're funded.

**Response:**
\`\`\`json
{
  "total": 5,
  "funded": 3,
  "faucets": [
    {
      "specAddress": "...",
      "faucetAddress": "...",
      "difficulty": 3,
      "rewardSol": 0.1,
      "balanceSol": 10.5,
      "funded": true,
      "mineCommand": "devnet-pow mine -d 3 --reward 0.1 -ud"
    }
  ]
}
\`\`\`

### Mining instructions
\`\`\`bash
curl /api/v1/mine/instructions
\`\`\`

Returns detailed mining instructions including the algorithm, PDA seeds, CLI commands, and tips.

### Health check
\`\`\`bash
curl /api/v1/health
\`\`\`

---

## Set Up Your Heartbeat 💓

Need devnet SOL regularly? Add the PoW faucet to your periodic check-in routine.

### Step 1: Add to your heartbeat file

Add this to your \`HEARTBEAT.md\` (or equivalent periodic task list):

\`\`\`markdown
## PoW Faucet (every 4-6 hours)
If 4+ hours since last faucet check and you need devnet SOL:
1. Fetch /heartbeat.md from the PoW faucet site and follow it
2. Update lastFaucetCheck timestamp in memory
\`\`\`

### Step 2: Track your state

Create or update your state file (e.g. \`memory/pow-faucet-state.json\`):

\`\`\`json
{
  "lastFaucetCheck": null,
  "lastMine": null,
  "totalSolMined": 0
}
\`\`\`

### Step 3: That's it!

Your heartbeat will now remind you to:
- Check if faucets have SOL available
- Mine when you need devnet SOL
- Track your mining progress

### Why This Matters

Devnet SOL runs out. The standard faucet rate-limits you. PoW mining gives you unlimited devnet SOL — as long as the faucets are funded and you're willing to grind.

For an AI agent running tests or deployments, having a reliable devnet SOL source is essential. The heartbeat keeps you topped up automatically.

---

## On-Chain Details

**Program:** \`PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL\`

### PDA Seeds

| PDA | Seeds |
|-----|-------|
| Spec | \`["spec", difficulty_u8_le, amount_u64_le]\` |
| Faucet | \`["source", spec_pubkey]\` |
| Receipt | \`["receipt", signer_pubkey, difficulty_u8_le]\` |

### Accounts for Airdrop instruction

| Account | Type | Description |
|---------|------|-------------|
| payer | Signer (mut) | Pays tx fees, receives SOL reward |
| signer | Signer | The mined keypair with leading A's |
| receipt | PDA (mut) | Prevents double-claims per keypair per difficulty |
| spec | PDA | Defines difficulty and reward amount |
| source | PDA (mut) | Holds the faucet's SOL balance |
| system_program | Program | System program |

### Creating a faucet

Anyone can create a new faucet and fund it:

\`\`\`bash
# Create a faucet with difficulty 5, reward 20 SOL
devnet-pow create -d 5 --reward 20 -ud

# Then send SOL to the faucet address to fund it
\`\`\`

---

## Mining Programmatically (without CLI)

If you can't install Rust/cargo, here's the algorithm:

\`\`\`
loop:
  keypair = generate_random_solana_keypair()
  pubkey_b58 = base58_encode(keypair.public_key)
  leading_a_count = count_leading_chars(pubkey_b58, 'A')

  if leading_a_count >= target_difficulty:
    // Build airdrop transaction
    // Derive PDAs for receipt, spec, source
    // Sign with both payer and mined keypair
    // Submit transaction
    break
\`\`\`

The mining is pure CPU work — no GPU needed. Each iteration is just keypair generation + base58 encoding + string comparison.

---

Good luck mining! ⛏️
`;

export async function GET() {
  return new NextResponse(SKILL_MD, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
