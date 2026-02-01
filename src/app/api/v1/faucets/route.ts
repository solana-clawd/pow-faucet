import { NextResponse } from "next/server";
import { getAllFaucets } from "@/app/lib/solana";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const faucets = await getAllFaucets();
    const funded = faucets.filter((f) => f.funded);
    return NextResponse.json({
      total: faucets.length,
      funded: funded.length,
      faucets,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch faucets", details: message }, { status: 500 });
  }
}
