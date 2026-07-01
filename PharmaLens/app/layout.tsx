import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Outfit } from "next/font/google";
import { Pill, ShieldCheck, Github, Twitter } from "lucide-react";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "PharmaLens Pakistan",
    template: "%s | PharmaLens"
  },
  description:
    "Professional Drug Intelligence Platform — search verified brand names by generic ingredient for the Pakistan market.",
  keywords: [
    "drug brand lookup Pakistan",
    "generic medicine brands",
    "pharmacy reference",
    "medicine brand names Pakistan"
  ],
  openGraph: {
    title: "PharmaLens Pakistan",
    description:
      "Professional Drug Intelligence Platform — verified brand name reference for Pakistan healthcare professionals.",
    type: "website"
  }
};

const navItems = [
  ["Lookup", "/"],
  ["Quiz", "/quiz"],
  ["Data Sources", "/data-sources"],
  ["Disclaimer", "/medical-disclaimer"]
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, outfit.variable, inter.className, "min-h-screen antialiased")}>
        {/* ─── Header ─── */}
        <header className="sticky top-0 z-50">
          {/* Glassmorphism bar */}
          <div
            style={{
              background: "rgba(11, 15, 26, 0.75)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group" aria-label="PharmaLens home">
                <span
                  className="flex size-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #22d3ee, #a78bfa)",
                    boxShadow: "0 0 20px rgba(34,211,238,0.3), 0 0 40px rgba(34,211,238,0.1)"
                  }}
                >
                  <Pill className="size-5 text-[#0b0f1a]" aria-hidden="true" />
                </span>
                <span>
                  <span
                    className="block text-base font-bold leading-tight"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      background: "linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    PharmaLens
                  </span>
                  <span className="block text-xs" style={{ color: "hsl(215 20% 45%)" }}>Professional Drug Intelligence Platform</span>
                </span>
              </Link>

              {/* Nav */}
              <nav className="flex flex-wrap gap-1 text-sm" aria-label="Main navigation">
                {navItems.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="relative rounded-lg px-4 py-2 font-medium transition-all duration-200 text-[hsl(215_20%_55%)] hover:text-[#22d3ee] hover:bg-[rgba(34,211,238,0.08)]"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <main>{children}</main>

        {/* ─── Footer ─── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "hsl(222 47% 6%)" }}>
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              {/* Left — brand + disclaimer */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-9 items-center justify-center rounded-xl"
                    style={{ background: "linear-gradient(135deg, #22d3ee, #a78bfa)" }}
                  >
                    <Pill className="size-4 text-[#0b0f1a]" />
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      background: "linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    PharmaLens
                  </span>
                </div>
                <div
                  className="flex gap-3 rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <ShieldCheck className="mt-0.5 size-5 shrink-0" style={{ color: "#22d3ee" }} aria-hidden="true" />
                  <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>
                    This tool is for professional reference only and is not a substitute for clinical
                    judgment, prescribing guidance, or official regulatory sources.
                  </p>
                </div>
              </div>

              {/* Right — links */}
              <div className="flex flex-col gap-4 lg:items-end lg:justify-center">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(215 20% 35%)" }}>
                  Navigate
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm lg:justify-end">
                  {[
                    ["About", "/about"],
                    ["Contact", "/contact"],
                    ["Privacy", "/privacy-policy"],
                    ["Terms", "/terms"],
                    ["Medical Disclaimer", "/medical-disclaimer"]
                  ].map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="transition-colors duration-200 text-[hsl(215_20%_48%)] hover:text-[#22d3ee]"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs" style={{ color: "hsl(215 20% 30%)" }}>
                    © {new Date().getFullYear()} PharmaLens Pakistan
                  </p>
                  <Link href="/admin" className="text-xs" style={{ color: "hsl(215 20% 38%)", textDecoration: "none" }}>
                    Admin
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
