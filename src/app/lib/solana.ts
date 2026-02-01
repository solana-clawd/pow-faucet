import { Connection, PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL");
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

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
  const connection = new Connection(RPC_URL, "confirmed");

  // Faucet spec accounts are 17 bytes: 8 discriminator + 1 difficulty + 8 amount
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: 17 }],
  });

  // Pre-compute all faucet PDAs
  const specs = accounts.map(({ pubkey, account }) => {
    const data = account.data;
    const difficulty = data[8];
    const rewardLamports = Number(data.readBigUInt64LE(9));
    const [faucetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("source"), pubkey.toBuffer()],
      PROGRAM_ID
    );
    return { pubkey, difficulty, rewardLamports, faucetPda };
  });

  // Batch fetch all balances in one RPC call using getMultipleAccountsInfo
  const faucetPdas = specs.map((s) => s.faucetPda);
  const balances: number[] = [];

  // getMultipleAccountsInfo has a 100-account limit per call, batch in chunks
  const CHUNK = 100;
  for (let i = 0; i < faucetPdas.length; i += CHUNK) {
    const chunk = faucetPdas.slice(i, i + CHUNK);
    const infos = await connection.getMultipleAccountsInfo(chunk);
    for (const info of infos) {
      balances.push(info ? info.lamports : 0);
    }
  }

  const faucets: FaucetInfo[] = specs.map((spec, i) => {
    const balanceLamports = balances[i];
    const rewardSol = spec.rewardLamports / 1e9;
    const balanceSol = balanceLamports / 1e9;
    return {
      specAddress: spec.pubkey.toBase58(),
      faucetAddress: spec.faucetPda.toBase58(),
      difficulty: spec.difficulty,
      rewardLamports: spec.rewardLamports,
      rewardSol,
      balanceLamports,
      balanceSol,
      funded: balanceLamports >= spec.rewardLamports,
      mineCommand: `devnet-pow mine -d ${spec.difficulty} --reward ${rewardSol} -ud`,
    };
  });

  // Sort by difficulty ascending, then reward descending
  faucets.sort((a, b) => a.difficulty - b.difficulty || b.rewardSol - a.rewardSol);

  return faucets;
}
