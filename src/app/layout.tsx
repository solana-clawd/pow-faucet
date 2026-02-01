import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PoW Faucet — Mine Devnet SOL",
  description: "Proof of Work faucet for Solana devnet. Grind keypairs, earn SOL.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <div className="inner">
            <a href="/" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              <span className="gradient-text">⛏️ PoW Faucet</span>
            </a>
            <div className="links">
              <a href="/faucets">Faucets</a>
              <a href="/skill.md">Skill</a>
              <a href="/heartbeat.md">Heartbeat</a>
              <a href="https://github.com/solana-clawd/pow-faucet">GitHub</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
