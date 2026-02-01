import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    overview: "Mine SOL by grinding keypairs with leading 'A' characters in their base58-encoded public key. Works on any Solana network.",
    programId: "PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL",
    networks: "Any — devnet, mainnet, wherever faucets are deployed",
    algorithm: {
      description: "Generate random Solana keypairs, base58-encode the public key, count leading 'A' characters. If count >= faucet difficulty, submit an airdrop transaction to claim SOL.",
      steps: [
        "1. Fetch faucet specs: getProgramAccounts with dataSize filter of 17",
        "2. Parse each spec: data[8] = difficulty (u8), data[9..17] = amount (u64 LE)",
        "3. Derive faucet PDA: seeds=['source', spec_pubkey]",
        "4. Check faucet balance >= amount (skip empty faucets)",
        "5. Grind: generate random Keypair, bs58.encode(pubkey.toBytes()), count leading 'A' chars",
        "6. If leading A count >= difficulty, build airdrop instruction",
        "7. Sign transaction with both payer and mined keypair",
        "8. Submit and confirm transaction",
      ],
    },
    javascript: {
      dependencies: "@solana/web3.js bs58",
      anchorDiscriminators: {
        airdrop: [113, 173, 36, 238, 38, 152, 22, 117],
        create: [24, 30, 200, 40, 5, 28, 7, 119],
      },
      airdropAccounts: [
        { name: "payer", signer: true, writable: true, description: "Your wallet — pays tx fees, receives SOL" },
        { name: "signer", signer: true, writable: false, description: "The mined keypair with leading A's" },
        { name: "receipt", signer: false, writable: true, description: "PDA: ['receipt', signer_pubkey, difficulty_u8_le]" },
        { name: "spec", signer: false, writable: false, description: "PDA: ['spec', difficulty_u8_le, amount_u64_le]" },
        { name: "source", signer: false, writable: true, description: "PDA: ['source', spec_pubkey] — holds faucet SOL" },
        { name: "systemProgram", signer: false, writable: false, description: "11111111111111111111111111111111" },
      ],
      instructionData: "Just the 8-byte airdrop discriminator, no additional data",
      grindingCode: "const kp = Keypair.generate(); const encoded = bs58.encode(kp.publicKey.toBytes()); let count = 0; for (const ch of encoded) { if (ch === 'A') count++; else break; }",
    },
    pdaSeeds: {
      spec: '["spec", difficulty_as_u8_le_bytes, amount_as_u64_le_bytes]',
      faucet: '["source", spec_pubkey_bytes]',
      receipt: '["receipt", signer_pubkey_bytes, difficulty_as_u8_le_bytes]',
    },
    difficultyEstimates: {
      "2": "~3,400 attempts (<1 second)",
      "3": "~200,000 attempts (1-5 seconds)",
      "4": "~12,000,000 attempts (30-120 seconds)",
      "5": "~700,000,000 attempts (15-60 minutes)",
    },
    tips: [
      "Use @solana/web3.js — no Rust or CLI installation needed",
      "Works on ANY network, not just devnet",
      "Lower difficulty faucets (2-3) mine in seconds",
      "A single mined keypair can claim from ALL faucets at or below its difficulty",
      "Each keypair+difficulty combo can only claim once (receipt PDA prevents double-claims)",
      "Check faucet balances before grinding — empty faucets can't pay out",
      "The payer needs a small SOL balance for tx fees (~0.005 SOL)",
    ],
    skillFile: "GET /skill.md — full guide with complete JS code examples",
    heartbeat: "GET /heartbeat.md — periodic check-in guide for agents",
  });
}
