export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getAllFaucets, FaucetInfo } from "@/app/lib/solana";

export default async function FaucetsPage() {
  let faucets: FaucetInfo[] = [];
  let error: string | null = null;

  try {
    faucets = await getAllFaucets();
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to fetch faucets";
  }

  const funded = faucets.filter((f) => f.funded);

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 48 }}>
      <h1 className="text-3xl font-bold mb-2">
        <span className="gradient-text">Active Faucets</span>
      </h1>
      <p className="text-muted mb-8">
        {funded.length} funded faucet{funded.length !== 1 ? "s" : ""} on Solana devnet.
      </p>

      {error && (
        <div className="glass mb-4" style={{ borderColor: "rgba(255,50,50,0.3)", color: "#ff5555" }}>
          Error: {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {funded.map((faucet) => (
          <div
            key={faucet.specAddress}
            className="glass faucet-card glow"
          >
            <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 16 }}>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-2xl font-bold gradient-text">
                    Difficulty {faucet.difficulty}
                  </span>
                  <span className="badge badge-green">FUNDED</span>
                </div>
                <p className="text-sm text-muted">
                  Reward: <span style={{ color: "white", fontFamily: "monospace" }}>{faucet.rewardSol} SOL</span>
                  {" · "}
                  Balance: <span style={{ color: "white", fontFamily: "monospace" }}>{faucet.balanceSol.toFixed(2)} SOL</span>
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <code className="text-sm text-muted" style={{ display: "block", marginBottom: 4 }}>
                  {faucet.faucetAddress.slice(0, 20)}...
                </code>
                <code className="text-sm text-green" style={{ background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: 4 }}>
                  {faucet.mineCommand}
                </code>
              </div>
            </div>
          </div>
        ))}

        {funded.length === 0 && !error && (
          <div className="glass text-center text-muted" style={{ padding: 32 }}>
            No funded faucets found on devnet.
          </div>
        )}
      </div>
    </div>
  );
}
