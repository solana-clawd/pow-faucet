import { NextResponse } from "next/server";

const SKILL_MD = `---
name: pow-faucet
version: 1.1.0
description: Mine Solana SOL using proof of work. Grind keypairs with leading 'A' prefixes and claim rewards on-chain. Works on any network.
homepage: https://pow-faucet-sigma.vercel.app
metadata: {"category":"devtools","program_id":"PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL"}
---

# PoW Faucet — Mine SOL with Proof of Work

A proof-of-work faucet for Solana. Instead of rate-limited airdrops, you earn SOL by grinding keypairs. The harder the work, the bigger the reward.

**Works on any network** — devnet, mainnet, wherever faucets are deployed.

**Program ID:** \`PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL\`

## Skill Files

| File | URL |
|------|-----|
| **SKILL.md** (this file) | \`https://pow-faucet-sigma.vercel.app/skill.md\` |
| **HEARTBEAT.md** | \`https://pow-faucet-sigma.vercel.app/heartbeat.md\` |

---

## How It Works

1. **Generate** a random Solana keypair
2. **Base58-encode** the public key
3. **Count** leading \`A\` characters in the base58 string
4. If the count **meets the faucet's difficulty**, you've mined a valid keypair
5. **Submit** an on-chain airdrop transaction signed by both your payer wallet and the mined keypair
6. The program **verifies** the prefix and **transfers SOL** from the faucet PDA to your payer
7. A **receipt PDA** is created to prevent double-claims at that difficulty

The more leading A's, the harder it is to find — but higher-difficulty faucets have bigger rewards.

---

## Mining with JavaScript (@solana/web3.js)

No Rust or CLI needed. Here's how to mine using pure JavaScript:

### Install dependencies

\`\`\`bash
npm install @solana/web3.js bs58
\`\`\`

### Step 1: Find available faucets

\`\`\`javascript
import { Connection, PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL");

// Use any RPC — devnet, mainnet, etc.
const connection = new Connection("https://api.devnet.solana.com");

// Faucet specs are 17-byte accounts: 8 discriminator + 1 difficulty + 8 amount
const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
  filters: [{ dataSize: 17 }],
});

for (const { pubkey, account } of accounts) {
  const data = account.data;
  const difficulty = data[8];
  const amount = Number(data.readBigUInt64LE(9));

  // Derive faucet PDA that holds the SOL
  const [faucetPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("source"), pubkey.toBuffer()],
    PROGRAM_ID
  );
  const balance = await connection.getBalance(faucetPda);

  console.log({
    spec: pubkey.toBase58(),
    faucet: faucetPda.toBase58(),
    difficulty,
    rewardSol: amount / 1e9,
    balanceSol: balance / 1e9,
    funded: balance >= amount,
  });
}
\`\`\`

### Step 2: Grind a keypair

\`\`\`javascript
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

function countLeadingAs(pubkey) {
  const encoded = bs58.encode(pubkey.toBytes());
  let count = 0;
  for (const ch of encoded) {
    if (ch === "A") count++;
    else break;
  }
  return count;
}

function grindKeypair(minDifficulty) {
  let attempts = 0;
  while (true) {
    attempts++;
    const kp = Keypair.generate();
    if (countLeadingAs(kp.publicKey) >= minDifficulty) {
      console.log(\\\`Found keypair after \\\${attempts} attempts: \\\${kp.publicKey.toBase58()}\\\`);
      return kp;
    }
    if (attempts % 100000 === 0) {
      console.log(\\\`Grinding... \\\${attempts} attempts so far\\\`);
    }
  }
}

// Difficulty 3 = ~1 in 200k attempts, Difficulty 5 = ~1 in 900M attempts
const minedKeypair = grindKeypair(3);
\`\`\`

### Step 3: Submit the airdrop transaction

\`\`\`javascript
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL");

// Anchor discriminator for "airdrop" = SHA256("global:airdrop")[0..8]
const AIRDROP_DISC = Buffer.from([113, 173, 36, 238, 38, 152, 22, 117]);

async function claimAirdrop(connection, payer, minedKeypair, specPubkey, difficulty) {
  // Derive PDAs
  const diffBuf = Buffer.alloc(1);
  diffBuf.writeUInt8(difficulty);

  const [receiptPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), minedKeypair.publicKey.toBuffer(), diffBuf],
    PROGRAM_ID
  );

  const [faucetPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("source"), specPubkey.toBuffer()],
    PROGRAM_ID
  );

  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: minedKeypair.publicKey, isSigner: true, isWritable: false },
      { pubkey: receiptPda, isSigner: false, isWritable: true },
      { pubkey: specPubkey, isSigner: false, isWritable: false },
      { pubkey: faucetPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: AIRDROP_DISC,
  });

  const tx = new Transaction().add(ix);
  const txid = await sendAndConfirmTransaction(connection, tx, [payer, minedKeypair]);
  console.log("Claimed! Tx:", txid);
  return txid;
}

// Usage:
const connection = new Connection("https://api.devnet.solana.com");
const payer = Keypair.fromSecretKey(/* your wallet secret key */);
const specPubkey = new PublicKey("/* spec address from step 1 */");
const minedKeypair = grindKeypair(3); // from step 2

await claimAirdrop(connection, payer, minedKeypair, specPubkey, 3);
\`\`\`

### Complete one-shot miner

\`\`\`javascript
import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";

const PROGRAM_ID = new PublicKey("PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL");
const AIRDROP_DISC = Buffer.from([113, 173, 36, 238, 38, 152, 22, 117]);

async function powMine(rpcUrl, payerSecretKey, targetLamports = 1_000_000_000) {
  const connection = new Connection(rpcUrl, "confirmed");
  const payer = Keypair.fromSecretKey(payerSecretKey);
  let earned = 0;

  // 1. Fetch all faucets
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: 17 }],
  });

  const faucets = [];
  for (const { pubkey, account } of accounts) {
    const difficulty = account.data[8];
    const amount = Number(account.data.readBigUInt64LE(9));
    const [faucetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("source"), pubkey.toBuffer()], PROGRAM_ID
    );
    const balance = await connection.getBalance(faucetPda);
    if (balance >= amount) {
      faucets.push({ specPubkey: pubkey, faucetPda, difficulty, amount });
    }
  }

  faucets.sort((a, b) => a.difficulty - b.difficulty);
  if (faucets.length === 0) { console.log("No funded faucets"); return; }

  const minDifficulty = faucets[0].difficulty;
  console.log(\\\`Mining (min difficulty \\\${minDifficulty}, \\\${faucets.length} faucets)...\\\`);

  // 2. Grind and claim
  while (earned < targetLamports) {
    const kp = Keypair.generate();
    const encoded = bs58.encode(kp.publicKey.toBytes());
    let leadingAs = 0;
    for (const ch of encoded) { if (ch === "A") leadingAs++; else break; }
    if (leadingAs < minDifficulty) continue;

    // Find all faucets this keypair qualifies for
    for (const faucet of faucets) {
      if (leadingAs < faucet.difficulty) continue;

      const diffBuf = Buffer.alloc(1);
      diffBuf.writeUInt8(faucet.difficulty);
      const [receiptPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("receipt"), kp.publicKey.toBuffer(), diffBuf], PROGRAM_ID
      );

      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: kp.publicKey, isSigner: true, isWritable: false },
          { pubkey: receiptPda, isSigner: false, isWritable: true },
          { pubkey: faucet.specPubkey, isSigner: false, isWritable: false },
          { pubkey: faucet.faucetPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: AIRDROP_DISC,
      });

      try {
        const tx = new Transaction().add(ix);
        const txid = await sendAndConfirmTransaction(connection, tx, [payer, kp]);
        earned += faucet.amount;
        console.log(\\\`+\\\${faucet.amount / 1e9} SOL (tx: \\\${txid}) — total: \\\${earned / 1e9} SOL\\\`);
      } catch (e) {
        console.log(\\\`Claim failed for difficulty \\\${faucet.difficulty}: \\\${e.message}\\\`);
      }
    }
  }
  console.log(\\\`Done! Earned \\\${earned / 1e9} SOL\\\`);
}

// Run it:
// powMine("https://api.devnet.solana.com", mySecretKeyUint8Array);
// powMine("https://api.mainnet-beta.solana.com", mySecretKeyUint8Array);
\`\`\`

---

## API Endpoints

**Base URL:** \`https://pow-faucet-sigma.vercel.app\`

### List faucets (devnet)
\`\`\`bash
curl https://pow-faucet-sigma.vercel.app/api/v1/faucets
\`\`\`

Returns all on-chain faucets with difficulty, reward, balance, and funded status.

### Mining instructions
\`\`\`bash
curl https://pow-faucet-sigma.vercel.app/api/v1/mine/instructions
\`\`\`

### Health check
\`\`\`bash
curl https://pow-faucet-sigma.vercel.app/api/v1/health
\`\`\`

---

## On-Chain Details

**Program:** \`PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL\`

### PDA Seeds

| PDA | Seeds |
|-----|-------|
| Spec | \`["spec", difficulty_u8_le, amount_u64_le]\` |
| Faucet (source) | \`["source", spec_pubkey]\` |
| Receipt | \`["receipt", signer_pubkey, difficulty_u8_le]\` |

### Airdrop instruction accounts

| # | Account | Signer | Writable | Description |
|---|---------|--------|----------|-------------|
| 0 | payer | ✅ | ✅ | Pays tx fees, receives SOL reward |
| 1 | signer | ✅ | ❌ | The mined keypair with leading A's |
| 2 | receipt | ❌ | ✅ | PDA — prevents double-claims |
| 3 | spec | ❌ | ❌ | PDA — defines difficulty + reward |
| 4 | source | ❌ | ✅ | PDA — holds faucet SOL balance |
| 5 | system_program | ❌ | ❌ | \`11111111111111111111111111111111\` |

### Anchor discriminator

\`\`\`
airdrop: [113, 173, 36, 238, 38, 152, 22, 117]  // SHA256("global:airdrop")[0..8]
create:  [24, 30, 200, 40, 5, 28, 7, 119]        // SHA256("global:create")[0..8]
\`\`\`

### Creating a faucet (JS)

\`\`\`javascript
const CREATE_DISC = Buffer.from([24, 30, 200, 40, 5, 28, 7, 119]);

function buildCreateInstruction(payer, difficulty, amountLamports) {
  const diffBuf = Buffer.alloc(1);
  diffBuf.writeUInt8(difficulty);
  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(BigInt(amountLamports));

  const [specPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("spec"), diffBuf, amountBuf], PROGRAM_ID
  );

  // Instruction data: discriminator + difficulty (u8) + amount (u64 LE)
  const data = Buffer.concat([CREATE_DISC, diffBuf, amountBuf]);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: specPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

// After creating, send SOL to the derived faucet PDA to fund it
\`\`\`

### Difficulty estimates

| Difficulty | Avg attempts | Approx time (JS) |
|------------|-------------|-------------------|
| 2 | ~3,400 | < 1 second |
| 3 | ~200,000 | 1-5 seconds |
| 4 | ~12,000,000 | 30-120 seconds |
| 5 | ~700,000,000 | 15-60 minutes |

---

## Set Up Your Heartbeat 💓

Add the PoW faucet to your periodic check-in routine so you stay funded.

### Step 1: Add to your heartbeat file

\`\`\`markdown
## PoW Faucet (every 4-6 hours)
If 4+ hours since last faucet check and you need SOL:
1. Fetch https://pow-faucet-sigma.vercel.app/heartbeat.md and follow it
2. Update lastFaucetCheck timestamp in memory
\`\`\`

### Step 2: Track your state

\`\`\`json
{
  "lastFaucetCheck": null,
  "lastMine": null,
  "totalSolMined": 0
}
\`\`\`

### Why This Matters

The standard devnet faucet rate-limits you. PoW mining gives you unlimited SOL — as long as faucets are funded and you can grind. For agents running tests or deployments, a reliable SOL source is essential.

On mainnet, anyone can create and fund faucets — making this a permissionless way to distribute SOL for work.

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
