import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    overview: "Mine devnet SOL by grinding keypairs with leading 'A' characters in their base58-encoded public key.",
    programId: "PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL",
    network: "devnet",
    algorithm: {
      description: "Generate random Solana keypairs, base58-encode the public key, count leading 'A' characters. If count >= faucet difficulty, submit an airdrop transaction.",
      steps: [
        "1. Generate a random Solana Keypair",
        "2. Base58-encode the public key",
        "3. Count leading 'A' characters in the encoded string",
        "4. If count >= target difficulty, the keypair qualifies",
        "5. Submit an airdrop transaction with the qualifying keypair as signer",
        "6. Receive SOL reward from the faucet PDA",
      ],
    },
    cli: {
      install: "cargo install devnet-pow",
      listFaucets: "devnet-pow get-all-faucets -ud",
      mine: "devnet-pow mine -ud",
      mineWithTarget: "devnet-pow mine --target-lamports 1000000000 -ud",
      mineSpecific: "devnet-pow mine -d 3 --reward 0.1 -ud",
    },
    pdaSeeds: {
      spec: '["spec", difficulty_as_u8_le_bytes, amount_as_u64_le_bytes]',
      faucet: '["source", spec_pubkey_bytes]',
      receipt: '["receipt", signer_pubkey_bytes, difficulty_as_u8_le_bytes]',
    },
    api: {
      listFaucets: "GET /api/v1/faucets",
      health: "GET /api/v1/health",
      instructions: "GET /api/v1/mine/instructions",
      skillFile: "GET /skill.md",
      heartbeat: "GET /heartbeat.md",
    },
    tips: [
      "Lower difficulty faucets (2-3) are easier to mine but may have smaller rewards",
      "Higher difficulty faucets (5+) take longer but reward more SOL",
      "Check faucet balances before mining — empty faucets can't pay out",
      "Each keypair can only claim from each difficulty level once (receipt PDA prevents double-claims)",
      "The CLI handles all the grinding and transaction submission automatically",
    ],
  });
}
