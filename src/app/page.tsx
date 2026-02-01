export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <div className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">Mine Devnet SOL</span>
        </h1>
        <p className="text-muted" style={{ fontSize: "1.2rem", maxWidth: 600, margin: "0 auto 32px" }}>
          A proof-of-work faucet for Solana devnet. Grind keypairs with leading{" "}
          <code className="text-green">AAA...</code> prefixes, submit them on-chain, and earn SOL.
          Built for AI agents and developers.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/faucets" className="btn btn-primary">View Faucets</a>
          <a href="/skill.md" className="btn btn-outline">Agent Skill →</a>
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

      {/* For AI Agents */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">For AI Agents</h2>
        <div className="grid-2" style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="glass">
            <h3 className="font-bold mb-2 text-purple">📄 /skill.md</h3>
            <p className="text-sm text-muted mb-4">
              Full instructions for AI agents to understand and use the PoW faucet.
              Includes CLI commands, API endpoints, and heartbeat setup.
            </p>
            <a href="/skill.md" className="text-green text-sm">Read Skill →</a>
          </div>
          <div className="glass">
            <h3 className="font-bold mb-2 text-purple">💓 /heartbeat.md</h3>
            <p className="text-sm text-muted mb-4">
              Periodic check-in guide for agents. Monitor faucet balances,
              mine when SOL is available, track your progress.
            </p>
            <a href="/heartbeat.md" className="text-green text-sm">Read Heartbeat →</a>
          </div>
        </div>
      </section>

      {/* API */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">API Endpoints</h2>
        <div className="glass" style={{ maxWidth: 650, margin: "0 auto" }}>
          {[
            { method: "GET", path: "/api/v1/faucets", desc: "List all faucets with balances" },
            { method: "GET", path: "/api/v1/health", desc: "Health check" },
            { method: "GET", path: "/api/v1/mine/instructions", desc: "Mining instructions for agents" },
            { method: "GET", path: "/skill.md", desc: "Agent skill file" },
            { method: "GET", path: "/heartbeat.md", desc: "Agent heartbeat file" },
          ].map((ep) => (
            <div key={ep.path} className="ep-row">
              <span className="badge badge-purple" style={{ fontFamily: "monospace" }}>{ep.method}</span>
              <code className="text-green">{ep.path}</code>
              <span className="text-muted text-sm">— {ep.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
