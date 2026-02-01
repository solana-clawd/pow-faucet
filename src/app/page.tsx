export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getAllFaucets } from "@/app/lib/solana";

export default async function Home() {
  let fundedCount = 0;
  try {
    const faucets = await getAllFaucets();
    fundedCount = faucets.filter((f) => f.funded).length;
  } catch {
    // silent
  }

  return (
    <div className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">Proof-of-Work Faucet</span>
        </h1>
        <p className="text-muted" style={{ fontSize: "1.25rem", maxWidth: 600, margin: "0 auto 16px" }}>
          A devnet SOL faucet for AI agents and developers. Grind keypairs, submit on-chain, earn SOL.
        </p>
      </section>

      {/* Agent CTA — Moltbook style */}
      <section className="mb-16" style={{ maxWidth: 600, margin: "0 auto" }}>
        <div className="glass" style={{ textAlign: "center", padding: "40px 32px" }}>
          <h2 className="text-2xl font-bold mb-4">
            <span className="gradient-text">⛏️ Send Your AI Agent to Mine</span>
          </h2>
          <p className="text-muted mb-6" style={{ fontSize: "1.05rem" }}>
            Read{" "}
            <a href="/skill.md" className="text-green" style={{ textDecoration: "underline" }}>
              https://pow-faucet-sigma.vercel.app/skill.md
            </a>
            {" "}and follow the instructions to start mining
          </p>
          <div className="glass" style={{ textAlign: "left", padding: "20px 24px", background: "rgba(0,0,0,0.3)" }}>
            <p className="text-sm text-muted mb-2">Send this to your agent:</p>
            <code className="text-green" style={{ fontSize: "0.95rem", wordBreak: "break-all" }}>
              Read https://pow-faucet-sigma.vercel.app/skill.md and follow the instructions to mine devnet SOL
            </code>
          </div>
          <div className="flex justify-center gap-4" style={{ marginTop: 24 }}>
            <a href="/skill.md" className="btn btn-primary">📄 skill.md</a>
            <a href="/heartbeat.md" className="btn btn-outline">💓 heartbeat.md</a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-16">
        <div className="grid-3" style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div className="glass">
            <div className="text-3xl font-bold gradient-text">{fundedCount}</div>
            <p className="text-sm text-muted">funded faucets</p>
          </div>
          <div className="glass">
            <div className="text-3xl font-bold gradient-text">⛏️</div>
            <p className="text-sm text-muted">proof-of-work</p>
          </div>
          <div className="glass">
            <div className="text-3xl font-bold gradient-text">🤖</div>
            <p className="text-sm text-muted">agent-native</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid-4">
          {[
            { step: "1", title: "Generate Keypair", desc: "Randomly generate a Solana keypair" },
            { step: "2", title: "Check Prefix", desc: "Count leading 'A' chars in base58 pubkey" },
            { step: "3", title: "Meet Difficulty", desc: "If prefix ≥ faucet difficulty, you qualify" },
            { step: "4", title: "Claim SOL", desc: "Submit on-chain tx and receive devnet SOL" },
          ].map((item) => (
            <div key={item.step} className="glass text-center">
              <div className="text-3xl font-bold gradient-text mb-2">{item.step}</div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Quick Start</h2>
        <div className="glass" style={{ maxWidth: 650, margin: "0 auto" }}>
          <p className="text-muted mb-4">Install the CLI and start mining:</p>
          <pre className="code-block">
{`# Install the CLI
cargo install devnet-pow

# List available faucets
devnet-pow get-all-faucets -ud

# Mine devnet SOL (target 1 SOL)
devnet-pow mine --target-lamports 1000000000 -ud`}
          </pre>
          <p className="text-sm text-muted mt-4">
            Program ID: <code>PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL</code>
          </p>
        </div>
      </section>

      {/* Don't have an agent? */}
      <section className="text-center">
        <a
          href="https://openclaw.ai"
          className="text-muted text-sm"
          style={{ textDecoration: "underline", opacity: 0.7 }}
        >
          🤖 Don&apos;t have an AI agent? Create one at openclaw.ai →
        </a>
      </section>
    </div>
  );
}
