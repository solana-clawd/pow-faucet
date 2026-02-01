/**
 * Pure JavaScript PoW mining implementation using @solana/web3.js
 * Works on any network (devnet, mainnet, etc.)
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const PROGRAM_ID = new PublicKey("PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL");

// Anchor instruction discriminator for "airdrop" = SHA256("global:airdrop")[0..8]
const AIRDROP_DISCRIMINATOR = Buffer.from([113, 173, 36, 238, 38, 152, 22, 117]);

export interface FaucetSpec {
  specPubkey: PublicKey;
  faucetPubkey: PublicKey;
  difficulty: number;
  amount: number; // lamports
}

/**
 * Derive the spec PDA for a given difficulty and amount
 */
export function deriveSpecPDA(difficulty: number, amount: number): [PublicKey, number] {
  const diffBuf = Buffer.alloc(1);
  diffBuf.writeUInt8(difficulty);

  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(BigInt(amount));

  return PublicKey.findProgramAddressSync(
    [Buffer.from("spec"), diffBuf, amountBuf],
    PROGRAM_ID
  );
}

/**
 * Derive the faucet (source) PDA for a given spec pubkey
 */
export function deriveFaucetPDA(specPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("source"), specPubkey.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the receipt PDA for a given signer and difficulty
 */
export function deriveReceiptPDA(signerPubkey: PublicKey, difficulty: number): [PublicKey, number] {
  const diffBuf = Buffer.alloc(1);
  diffBuf.writeUInt8(difficulty);

  return PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), signerPubkey.toBuffer(), diffBuf],
    PROGRAM_ID
  );
}

/**
 * Count leading 'A' characters in a base58-encoded public key
 */
export function countLeadingAs(pubkey: PublicKey): number {
  const encoded = bs58.encode(pubkey.toBytes());
  let count = 0;
  for (const ch of encoded) {
    if (ch === 'A') count++;
    else break;
  }
  return count;
}

/**
 * Grind a keypair with the specified minimum number of leading A's
 * Returns the keypair and attempt count
 */
export function grindKeypair(minDifficulty: number, maxAttempts: number = 10_000_000): { keypair: Keypair; attempts: number } | null {
  for (let i = 0; i < maxAttempts; i++) {
    const keypair = Keypair.generate();
    if (countLeadingAs(keypair.publicKey) >= minDifficulty) {
      return { keypair, attempts: i + 1 };
    }
  }
  return null;
}

/**
 * Build the airdrop transaction instruction
 */
export function buildAirdropInstruction(
  payer: PublicKey,
  minedKeypair: Keypair,
  spec: FaucetSpec
): TransactionInstruction {
  const [receiptPda] = deriveReceiptPDA(minedKeypair.publicKey, spec.difficulty);
  const [faucetPda] = deriveFaucetPDA(spec.specPubkey);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: minedKeypair.publicKey, isSigner: true, isWritable: false },
      { pubkey: receiptPda, isSigner: false, isWritable: true },
      { pubkey: spec.specPubkey, isSigner: false, isWritable: false },
      { pubkey: faucetPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: AIRDROP_DISCRIMINATOR,
  });
}

/**
 * Full mining flow: grind keypair → build tx → submit
 */
export async function mine(
  connection: Connection,
  payer: Keypair,
  spec: FaucetSpec,
  maxAttempts: number = 10_000_000
): Promise<{ txid: string; attempts: number; reward: number } | null> {
  const result = grindKeypair(spec.difficulty, maxAttempts);
  if (!result) return null;

  const ix = buildAirdropInstruction(payer.publicKey, result.keypair, spec);
  const tx = new Transaction().add(ix);

  const txid = await sendAndConfirmTransaction(connection, tx, [payer, result.keypair]);

  return {
    txid,
    attempts: result.attempts,
    reward: spec.amount / 1e9,
  };
}
