import { NextResponse } from "next/server";

const HEARTBEAT_MD = `# PoW Faucet Heartbeat ⛏️

*Run this periodically when you need devnet SOL. Recommended: every 4-6 hours.*

## 1. Check if you need devnet SOL

Before mining, check your devnet balance:

\`\`\`bash
solana balance --url devnet
\`\`\`

If you have enough SOL for your needs, skip the rest. No point mining if you're already funded.

---

## 2. Check faucet status

\`\`\`bash
curl /api/v1/faucets
\`\`\`

Or with the CLI:
\`\`\`bash
devnet-pow get-all-faucets -ud
\`\`\`

**Look for:**
- Faucets with \`funded: true\` — these have SOL available
- Lower difficulty faucets (2-3) mine faster
- Higher reward faucets give more SOL per successful mine

If no faucets are funded, skip mining and try again next heartbeat.

---

## 3. Mine SOL

If faucets are available and you need SOL:

\`\`\`bash
# Mine ~1 SOL worth
devnet-pow mine --target-lamports 1000000000 -ud

# Or mine a smaller amount for quick top-up
devnet-pow mine --target-lamports 100000000 -ud
\`\`\`

**Tips:**
- Start with low difficulty faucets for quick results
- Mining is CPU-bound — it may take a few seconds to minutes depending on difficulty
- The CLI automatically selects the best faucets if you don't specify

---

## 4. Verify your balance

After mining:
\`\`\`bash
solana balance --url devnet
\`\`\`

---

## 5. Update your state

Save your mining state (e.g. \`memory/pow-faucet-state.json\`):

\`\`\`json
{
  "lastFaucetCheck": "<current_timestamp>",
  "lastMine": "<current_timestamp>",
  "totalSolMined": 1.5,
  "devnetBalance": 3.2
}
\`\`\`

---

## Decision guide

| Situation | Action |
|-----------|--------|
| Balance > 5 SOL | Skip mining, check again later |
| Balance 1-5 SOL | Mine a small top-up (0.5-1 SOL) |
| Balance < 1 SOL | Mine aggressively (2-5 SOL target) |
| No funded faucets | Try standard airdrop: \`solana airdrop 2 --url devnet\` |
| Mining fails | Check if your keypair has enough SOL for tx fees (~0.005 SOL) |

---

## When to tell your human

**Do tell them:**
- All faucets are empty (no mining possible)
- Mining repeatedly fails
- You need mainnet SOL (this is devnet only!)

**Don't bother them:**
- Routine mining success
- Normal balance checks
- Faucet status updates

---

*Keep your devnet wallet funded. Mine smart, not hard. ⛏️*
`;

export async function GET() {
  return new NextResponse(HEARTBEAT_MD, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
