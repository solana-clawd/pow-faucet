import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

const PROGRAM_ID = new PublicKey("PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL");
const DEVNET_URL = "https://api.devnet.solana.com";

export interface FaucetInfo {
  specAddress: string;
  faucetAddress: string;
  difficulty: number;
  rewardLamports: number;
  rewardSol: number;
  balanceLamports: number;
  balanceSol: number;
  funded: boolean;
  mineCommand: string;
}

export async function getAllFaucets(): Promise<FaucetInfo[]> {
  const connection = new Connection(DEVNET_URL, "confirmed");

  // Faucet spec accounts are 17 bytes: 8 discriminator + 1 difficulty + 8 amount
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: 17 }],
  });

  const faucets: FaucetInfo[] = [];

  for (const { pubkey, account } of accounts) {
    const data = account.data;
    if (data.length < 17) continue;

    const difficulty = data[8];
    const rewardLamports = Number(data.readBigUInt64LE(9));

    // Derive faucet PDA
    const [faucetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("source"), pubkey.toBuffer()],
      PROGRAM_ID
    );

    let balanceLamports = 0;
    try {
      balanceLamports = await connection.getBalance(faucetPda);
    } catch {
      // faucet might not exist yet
    }

    const rewardSol = rewardLamports / 1e9;
    const balanceSol = balanceLamports / 1e9;

    faucets.push({
      specAddress: pubkey.toBase58(),
      faucetAddress: faucetPda.toBase58(),
      difficulty,
      rewardLamports,
      rewardSol,
      balanceLamports,
      balanceSol,
      funded: balanceLamports >= rewardLamports,
      mineCommand: `devnet-pow mine -d ${difficulty} --reward ${rewardSol} -ud`,
    });
  }

  // Sort by difficulty ascending, then reward descending
  faucets.sort((a, b) => a.difficulty - b.difficulty || b.rewardSol - a.rewardSol);

  return faucets;
}
