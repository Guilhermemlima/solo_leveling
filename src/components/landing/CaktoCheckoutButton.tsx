"use client";
import { motion } from "framer-motion";

type PlanoKey = "mensal" | "anual" | "vitalicio" | "fundador";

interface CaktoCheckoutButtonProps {
  plano?: PlanoKey;
  planType?: PlanoKey;
  label?: string;
  variant?: "primary" | "secondary" | "gold";
  className?: string;
}

const VARIANT_STYLES = {
  primary:
    "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-500/30",
  secondary:
    "bg-slate-800/80 border border-violet-500/50 hover:border-violet-400 text-white hover:bg-slate-800",
  gold:
    "bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-black shadow-lg shadow-amber-500/40",
};

const PLAN_LABELS: Record<PlanoKey, string> = {
  mensal:    "Iniciar minha ascensão",
  anual:     "Garantir plano anual",
  vitalicio: "Garantir acesso fundador",
  fundador:  "Garantir acesso fundador",
};

function getCheckoutUrl(plano: PlanoKey): string {
  const urls: Record<PlanoKey, string> = {
    mensal:    process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_MENSAL   || "",
    anual:     process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_ANUAL    || "",
    vitalicio: process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_FUNDADOR || "",
    fundador:  process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_FUNDADOR || "",
  };
  return urls[plano] || "";
}

export default function CaktoCheckoutButton({
  plano,
  planType,
  label,
  variant = "primary",
  className = "",
}: CaktoCheckoutButtonProps) {
  const key: PlanoKey = planType ?? plano ?? "mensal";
  const url = getCheckoutUrl(key);
  const isConfigured = url.startsWith("http");
  const href = isConfigured ? url : "#";
  const btnLabel = label ?? PLAN_LABELS[key];

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!isConfigured) {
      e.preventDefault();
      console.warn(
        `[Ascend] Checkout não configurado para o plano "${key}". ` +
        `Configure NEXT_PUBLIC_CAKTO_CHECKOUT_${key.toUpperCase()} no .env`
      );
      return;
    }

    try {
      window.dispatchEvent(new CustomEvent("ascend:checkout_click", {
        detail: { plano: key, url },
      }));
      if (typeof window !== "undefined" && "gtag" in window) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
          "event", "begin_checkout",
          { plano: key, currency: "BRL" }
        );
      }
    } catch {
      // analytics opcional
    }
  }

  return (
    <motion.a
      href={href}
      target={isConfigured ? "_blank" : undefined}
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${VARIANT_STYLES[variant]} ${className} ${!isConfigured ? "opacity-70" : ""}`}
      title={!isConfigured ? "Configure o link de checkout no .env" : undefined}
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      {btnLabel}
    </motion.a>
  );
}
