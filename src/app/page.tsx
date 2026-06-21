"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import HeroVideoBackground from "@/components/landing/HeroVideoBackground";
import CaktoCheckoutButton from "@/components/landing/CaktoCheckoutButton";

const RANKS = [
  { rank: "E", desc: "Iniciante",  border: "border-slate-500",  color: "text-slate-300",  glow: "" },
  { rank: "D", desc: "Aprendiz",   border: "border-cyan-500",   color: "text-cyan-300",   glow: "shadow-cyan-500/20" },
  { rank: "C", desc: "Combatente", border: "border-blue-500",   color: "text-blue-300",   glow: "shadow-blue-500/30" },
  { rank: "B", desc: "Guerreiro",  border: "border-violet-500", color: "text-violet-300", glow: "shadow-violet-500/40" },
  { rank: "A", desc: "Élite",      border: "border-purple-400", color: "text-purple-300", glow: "shadow-purple-500/50" },
  { rank: "S", desc: "Lendário",   border: "border-amber-400",  color: "text-amber-300",  glow: "shadow-amber-500/60" },
];

const FEATURES = [
  { icon: "⚔️", title: "Missões Diárias", desc: "Cada tarefa vira uma missão com EXP, moedas e recompensas. Complete missões diárias, semanais e mensais para acelerar sua evolução." },
  { icon: "📈", title: "Progressão de Nível", desc: "Ganhe EXP a cada conquista, suba de nível e desbloqueie novos poderes. Seu progresso é visível, mensurável e permanente." },
  { icon: "🏆", title: "Sistema de Ranks", desc: "Do Rank E ao lendário Rank S, evolua através de 6 patentes que representam suas conquistas reais no mundo físico." },
  { icon: "🎒", title: "Inventário & Equipamentos", desc: "Colecione armas, armaduras e itens raros. Equipe os melhores itens para aumentar seus atributos e poder de combate." },
  { icon: "🧿", title: "Caixas & Recompensas", desc: "Abra caixas épicas ao completar desafios. Cada caixa pode conter equipamentos raros, moedas e fragmentos exclusivos." },
  { icon: "🔮", title: "Mais de 100 Conquistas", desc: "Um sistema de conquistas que registra cada marco da sua jornada — de iniciante a lendário, cada vitória conta." },
];

const PLANS = [
  {
    nome: "Mensal", plano: "mensal" as const, preco: "R$ 9,90", precoOriginal: "R$ 19,90", periodo: "/mês",
    desc: "Acesso completo por 30 dias.", destaque: false, variant: "secondary" as const,
    recursos: ["Missões diárias ilimitadas", "Sistema de EXP e ranks", "Inventário completo", "Conquistas e recompensas"],
  },
  {
    nome: "Anual", plano: "anual" as const, preco: "R$ 47,90", precoOriginal: "R$ 97,90", periodo: "/ano",
    desc: "Melhor custo-benefício. Economize 75%.", destaque: true, variant: "primary" as const,
    equiv: "ou R$3,99/mês",
    recursos: ["Tudo do plano mensal", "Equipamentos exclusivos mensais", "Rank de Fundador no perfil", "Prioridade em novos recursos", "Caixas bônus todo mês"],
  },
  {
    nome: "Fundador", plano: "vitalicio" as const, preco: "R$ 97,90", precoOriginal: "R$ 197,90", periodo: "único",
    desc: "Acesso vitalício. Sem mensalidades jamais.", destaque: false, variant: "gold" as const,
    urgencia: "Apenas 47 vagas",
    recursos: ["Tudo do plano anual", "Acesso vitalício garantido", "Badge exclusivo de Fundador", "Itens lendários iniciais", "Suporte prioritário (24h)", "Acesso antecipado a features"],
  },
];

const TESTIMONIALS = [
  {
    name: "Rafael Mendes",
    role: "Desenvolvedor · São Paulo",
    avatar: "R",
    avatarBg: "from-violet-600 to-cyan-600",
    text: "Sempre soube o que queria fazer, mas nunca conseguia manter consistência. Com o Ascend, virou um vício positivo — cada missão concluída me dá aquela sensação de progresso real que nenhum outro app deu.",
    stars: 5,
    rank: "Rank A",
  },
  {
    name: "Juliana Costa",
    role: "Designer · Curitiba",
    avatar: "J",
    avatarBg: "from-amber-600 to-violet-600",
    text: "Estava cética no começo, achando que era mais um app de tarefas. Mas a sensação de subir de nível depois de um mês de consistência é diferente de tudo que já usei. Vale cada centavo.",
    stars: 5,
    rank: "Rank B",
  },
  {
    name: "Lucas Ferreira",
    role: "Estudante · Belo Horizonte",
    avatar: "L",
    avatarBg: "from-cyan-600 to-blue-600",
    text: "Uso para organizar estudos, treinos e leituras. O sistema de ranks me mantém motivado mesmo nas semanas difíceis. Em 45 dias cheguei ao Rank B e criei hábitos que nunca consegui antes.",
    stars: 5,
    rank: "Rank C → B",
  },
];

const FAQ = [
  { q: "O app funciona no celular?", a: "Sim. O Ascend System é 100% responsivo e funciona no navegador do celular (iOS e Android) sem precisar instalar nada. Uma versão nativa está nos planos." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim. O plano mensal cancela a qualquer momento. O plano anual tem garantia de 7 dias — se não gostar por qualquer motivo, devolvemos 100% do valor, sem burocracia." },
  { q: "O que acontece logo após o pagamento?", a: "Você recebe o acesso instantaneamente. Basta criar sua conta e começar a primeira missão em menos de 2 minutos. Nenhum download necessário." },
  { q: "Meus dados ficam salvos?", a: "Sim. Todo seu progresso — XP, nível, inventário, missões e conquistas — fica armazenado em nuvem de forma segura e sincronizado entre dispositivos." },
  { q: "O que é o Rank de Fundador?", a: "Um badge exclusivo e permanente no seu perfil que identifica você como um dos primeiros membros do sistema. Apenas assinantes anuais e fundadores recebem — e não será vendido futuramente." },
  { q: "O que são as Caixas Bônus mensais?", a: "Todo mês, assinantes anuais recebem automaticamente caixas com equipamentos raros e épicos — itens que não estão disponíveis na loja comum e que acumulam no inventário." },
  { q: "Preciso saber algo sobre RPG ou games?", a: "Nenhum conhecimento necessário. O sistema é intuitivo desde a primeira tela. Se você faz tarefas no dia a dia, já está pronto para usar o Ascend." },
  { q: "Existe suporte se eu tiver dúvidas?", a: "Sim. Todos os planos têm suporte por e-mail. O plano Fundador inclui suporte prioritário com resposta garantida em até 24 horas úteis." },
];

const PARA_QUEM = [
  {
    icon: "🧑‍💻",
    titulo: "Profissionais que querem mais foco",
    desc: "Se você tem muitas responsabilidades e sente que o dia acaba sem progresso real — o Ascend transforma sua agenda em missões com objetivos claros e recompensas visíveis.",
  },
  {
    icon: "🏋️",
    titulo: "Pessoas que querem criar hábitos",
    desc: "Se você já tentou criar rotinas e abandonou — o sistema de EXP, streaks e ranks torna o processo de construir hábitos irresistível e visualmente recompensador.",
  },
  {
    icon: "📚",
    titulo: "Estudantes que precisam de consistência",
    desc: "Se você procrastina ou perde o fio da meada nos estudos — missões diárias de estudo com progresso em rank te mantêm no caminho mesmo quando a motivação cai.",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function AppMockup({ screen }: { screen: "dashboard" | "missions" | "inventory" }) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700/80 overflow-hidden shadow-2xl shadow-violet-900/20 w-full max-w-[280px]">
      {/* browser bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
        </div>
        <span className="text-slate-500 text-[10px] font-mono ml-1">
          {screen === "dashboard" ? "dashboard" : screen === "missions" ? "missões" : "inventário"}
        </span>
      </div>

      {screen === "dashboard" && (
        <div className="p-3 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0">G</div>
            <div className="min-w-0">
              <div className="text-white font-bold text-xs">Guerreiro das Sombras</div>
              <div className="text-[10px] text-cyan-400">Rank B · Nível 24</div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-2">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Experiência</span><span>2.840 / 4.000</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full">
              <div className="h-1.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full w-[71%]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[["12", "Missões", "text-violet-400"], ["7🔥", "Streak", "text-amber-400"], ["340", "Moedas", "text-cyan-400"]].map(([val, label, cls]) => (
              <div key={label} className="bg-slate-800 rounded-lg p-2 text-center">
                <div className={`${cls} font-bold text-sm`}>{val}</div>
                <div className="text-[9px] text-slate-400">{label}</div>
              </div>
            ))}
          </div>
          <div className="bg-slate-800/80 rounded-lg p-2">
            <div className="text-[10px] text-slate-400 mb-1.5">Atributos</div>
            <div className="space-y-1">
              {[["FOR", "bg-red-500", "75%"], ["INT", "bg-blue-500", "60%"], ["AGI", "bg-green-500", "45%"]].map(([attr, color, w]) => (
                <div key={attr} className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400 w-5">{attr}</span>
                  <div className="flex-1 h-1 bg-slate-700 rounded-full">
                    <div className={`h-1 ${color} rounded-full`} style={{ width: w }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === "missions" && (
        <div className="p-3 space-y-2">
          <div className="text-xs font-bold text-white mb-1">Missões de Hoje</div>
          {[
            { icon: "⚔️", title: "Treinar por 30 min", xp: "+80 XP", done: true },
            { icon: "📚", title: "Estudar 1 hora", xp: "+60 XP", done: true },
            { icon: "🧘", title: "Meditar 10 min", xp: "+40 XP", done: false },
            { icon: "💧", title: "Beber 2L de água", xp: "+30 XP", done: false },
          ].map((m) => (
            <div key={m.title} className={`flex items-center gap-2 rounded-lg p-2 ${m.done ? "bg-violet-900/30 border border-violet-500/30" : "bg-slate-800"}`}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${m.done ? "bg-violet-500 border-violet-500" : "border-slate-600"}`}>
                {m.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[10px] font-medium ${m.done ? "line-through text-slate-400" : "text-white"}`}>{m.icon} {m.title}</div>
              </div>
              <span className="text-[9px] text-cyan-400 shrink-0">{m.xp}</span>
            </div>
          ))}
          <div className="bg-slate-800 rounded-lg p-2 flex justify-between items-center">
            <span className="text-[10px] text-slate-400">Progresso diário</span>
            <span className="text-[10px] text-violet-400 font-bold">2 / 4</span>
          </div>
        </div>
      )}

      {screen === "inventory" && (
        <div className="p-3">
          <div className="text-xs font-bold text-white mb-2">Inventário</div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { icon: "⚔️", rarity: "EPIC", color: "border-purple-500 bg-purple-900/30" },
              { icon: "🛡️", rarity: "RARE", color: "border-blue-500 bg-blue-900/30" },
              { icon: "🗡️", rarity: "EPIC", color: "border-purple-500 bg-purple-900/30" },
              { icon: "🎩", rarity: "LEGENDARY", color: "border-amber-400 bg-amber-900/30" },
              { icon: "🏹", rarity: "UNCOMMON", color: "border-green-500 bg-green-900/30" },
              { icon: "🧤", rarity: "RARE", color: "border-blue-500 bg-blue-900/30" },
              { icon: "💍", rarity: "LEGENDARY", color: "border-amber-400 bg-amber-900/30" },
              { icon: "🥾", rarity: "COMMON", color: "border-slate-500 bg-slate-800" },
            ].map((item, i) => (
              <div key={i} className={`aspect-square border-2 ${item.color} rounded-lg flex items-center justify-center text-lg`}>
                {item.icon}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5">
            {[["LEGENDARY", "text-amber-400"], ["EPIC", "text-purple-400"]].map(([r, cls]) => (
              <div key={r} className="bg-slate-800 rounded px-1.5 py-0.5 flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${cls.replace("text-", "bg-")}`}/>
                <span className={`text-[8px] ${cls}`}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [showSticky, setShowSticky] = useState(false);
  const [faqOpen, setFaqOpen]       = useState<number | null>(null);
  const [activeScreen, setActiveScreen] = useState<"dashboard" | "missions" | "inventory">("dashboard");

  const heroRef    = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgeRef   = useRef<HTMLDivElement>(null);
  const titleRef   = useRef<HTMLHeadingElement>(null);
  const paraRef    = useRef<HTMLParagraphElement>(null);
  const disclaimer = useRef<HTMLParagraphElement>(null);

  // sticky CTA scroll listener
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GSAP hero animations — respects prefers-reduced-motion
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!motionOk) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(badgeRef.current,      { y: -50, opacity: 0, duration: 0.8, ease: "back.out(2)" })
        .from(titleRef.current,      { y: 80, opacity: 0, duration: 1.1, ease: "power4.out" }, "-=0.35")
        .from(paraRef.current,       { y: 30, opacity: 0, duration: 0.75 }, "-=0.55")
        .from("[data-hero-btn]",      { scale: 0.82, opacity: 0, duration: 0.65, stagger: 0.18, ease: "back.out(1.6)" }, "-=0.4")
        .from(disclaimer.current,    { opacity: 0, duration: 0.5 }, "-=0.1");

      gsap.to(badgeRef.current, { y: -7, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.9 });

      gsap.to("[data-hero-btn]:first-of-type a", {
        boxShadow: "0 0 32px rgba(139,92,246,0.65), 0 0 64px rgba(6,182,212,0.25)",
        duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.4,
      });

      const gradSpan = titleRef.current?.querySelector<HTMLElement>("span");
      if (gradSpan) {
        gsap.fromTo(gradSpan,
          { backgroundSize: "200% 100%", backgroundPosition: "100% 0%" },
          { backgroundPosition: "0% 0%", duration: 2.5, ease: "power2.inOut", yoyo: true, repeat: -1, delay: 1 },
        );
      }

      gsap.to(contentRef.current, {
        opacity: 0, y: -25, ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "80% top", end: "100% top", scrub: 1.2 },
      });

      const video = heroRef.current?.querySelector<HTMLVideoElement>("video");
      if (video) {
        gsap.to(video, {
          scale: 1.08, ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="bg-slate-950 text-white overflow-x-hidden">

      {/* ── TOP NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60">
        <span className="font-black tracking-tight text-lg bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          ASCEND
        </span>
        <div className="flex items-center gap-2">
          <a href="#planos" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/60">
            Planos
          </a>
          <Link href="/login" className="px-4 py-1.5 text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors">
            Entrar
          </Link>
        </div>
      </nav>

      {/* ── STICKY CTA (mobile only, after hero) ── */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 sm:hidden"
          >
            <CaktoCheckoutButton
              plano="anual"
              label="Garantir acesso agora"
              variant="primary"
              className="w-full justify-center py-3.5 text-base"
            />
            <p className="text-center text-[11px] text-slate-500 mt-1.5">Garantia de 7 dias · Cancele quando quiser</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        id="inicio"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden"
      >
        <HeroVideoBackground videoMp4="/videos/ascend-hero-bg.mp4" poster="/videos/hero-poster.svg" />
        <AnimatedBackground intensity="medium" transparent={true} className="z-[2] opacity-60" />

        <div ref={contentRef} className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/10 rounded-full px-4 py-1.5 text-cyan-300 text-sm font-mono whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Pré-venda Fundador — Vagas Limitadas
          </div>

          <h1 ref={titleRef} className="text-5xl md:text-7xl font-black leading-tight">
            Pare de procrastinar.{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
              Comece a evoluir.
            </span>
          </h1>

          <p ref={paraRef} className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            O Ascend System transforma tarefas diárias em missões com EXP, ranks e recompensas reais. Torne sua evolução pessoal visível, mensurável e irresistível.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div data-hero-btn className="w-full sm:w-auto">
              <a
                href="#planos"
                className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-500/30"
              >
                ⚡ Iniciar minha ascensão
              </a>
            </div>
            <div data-hero-btn className="w-full sm:w-auto">
              <a
                href="#planos"
                className="flex items-center justify-center gap-2 w-full px-8 py-4 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition-all text-base font-semibold"
              >
                Ver planos ↓
              </a>
            </div>
          </div>

          <p ref={disclaimer} className="text-slate-500 text-sm">
            Garantia de 7 dias · Cobrança anual única · Cancele antes da renovação
          </p>
        </div>

        {/* already have account — subtle link */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <Link href="/login" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
            Já tenho uma conta →
          </Link>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="py-8 px-6 border-y border-slate-800/60 bg-slate-950">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            ["200+",   "Membros ativos"],
            ["4.9 ★",  "Avaliação média"],
            ["30d",    "Para sentir a diferença"],
            ["7 dias", "Garantia de reembolso"],
          ].map(([val, label], i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-black text-white">{val}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-3">O sistema</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Tudo que você precisa para <span className="text-violet-400">ascender</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Mecânicas de RPG aplicadas à vida real. Não é motivação — é um sistema que funciona mesmo quando a vontade vai embora.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group border border-slate-800 hover:border-violet-500/50 rounded-2xl p-6 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCREENSHOTS / APP DEMO ── */}
      <section className="relative py-24 px-6 bg-slate-900/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-3">O app</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Veja o sistema <span className="text-cyan-400">em ação</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Uma interface dark fantasy construída para manter você focado, motivado e em evolução constante.
            </p>
          </motion.div>

          {/* tab selector */}
          <div className="flex justify-center gap-2 mb-10">
            {(["dashboard", "missions", "inventory"] as const).map((s) => {
              const labels = { dashboard: "Dashboard", missions: "Missões", inventory: "Inventário" };
              return (
                <button
                  key={s}
                  onClick={() => setActiveScreen(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeScreen === s
                      ? "bg-violet-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {labels[s]}
                </button>
              );
            })}
          </div>

          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* glow ring behind mockup */}
              <div className="absolute inset-0 bg-violet-600/20 rounded-2xl blur-2xl scale-110" />
              <AppMockup screen={activeScreen} />
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-4 mt-10 max-w-lg mx-auto text-center">
            {[
              ["⚔️", "Missões", "Diárias, semanais e mensais"],
              ["📊", "Progresso", "EXP, níveis e atributos"],
              ["🎒", "Recompensas", "Itens, caixas e conquistas"],
            ].map(([icon, title, desc]) => (
              <div key={title} className="text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-sm font-bold text-white">{title}</div>
                <div className="text-xs text-slate-400">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARA QUEM É ── */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-3">Para quem é</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Este sistema foi feito <span className="text-violet-400">para você</span> se…
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PARA_QUEM.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="border border-slate-800 hover:border-violet-500/40 rounded-2xl p-6 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="text-white font-bold text-base mb-3">{p.titulo}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RANKS ── */}
      <section className="relative py-24 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-3">Progressão</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Sua evolução tem <span className="text-amber-400">6 ranks</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Comece como iniciante Rank E e evolua até o lendário Rank S. Cada rank representa conquistas reais no mundo físico.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {RANKS.map((r, i) => (
              <motion.div
                key={r.rank}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.08, y: -4 }}
                className={`border-2 ${r.border} rounded-xl p-4 text-center bg-slate-900/80 shadow-lg ${r.glow} cursor-default`}
              >
                <p className={`text-2xl font-black ${r.color}`}>{r.rank}</p>
                <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-3">Depoimentos</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Quem já começou a <span className="text-violet-400">ascender</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="border border-slate-800 rounded-2xl p-6 bg-slate-900/60 flex flex-col gap-4"
              >
                <StarRating count={t.stars} />
                <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.role}</div>
                  </div>
                  <span className="ml-auto text-xs text-amber-400 font-mono">{t.rank}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative py-24 px-6 bg-slate-900/40">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-4xl font-black">
              3 passos para sua <span className="text-cyan-400">ascensão</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              { num: "01", title: "Desbloqueie o acesso",  desc: "Escolha seu plano e ative sua conta em segundos. A ativação é automática após a confirmação do pagamento — sem espera." },
              { num: "02", title: "Defina suas missões",   desc: "Transforme suas metas diárias em missões do sistema. Cada tarefa concluída rende EXP, moedas e fragmentos de equipamento." },
              { num: "03", title: "Evolua e desbloqueie",  desc: "Suba de nível, mude de rank, colete itens raros e veja seu progresso crescer a cada dia. O sistema rastreia tudo por você." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-xl border border-violet-500/50 bg-violet-500/10 flex items-center justify-center">
                  <span className="text-violet-300 font-black text-xl font-mono">{step.num}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="planos" className="relative py-24 px-6 bg-slate-900/50">
        <AnimatedBackground intensity="low" className="opacity-30" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-3">Planos</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Escolha seu nível de{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                comprometimento
              </span>
            </h2>
            <p className="text-slate-400">Comece hoje. Garantia de 7 dias em todos os planos.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.nome}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  plan.destaque
                    ? "border-2 border-violet-500 bg-slate-900 shadow-2xl shadow-violet-500/20 md:scale-105"
                    : "border border-slate-700 bg-slate-900/80"
                }`}
              >
                {plan.destaque && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      MAIS POPULAR
                    </span>
                  </div>
                )}
                {"urgencia" in plan && plan.urgencia && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-slate-900 text-xs font-bold px-4 py-1 rounded-full">
                      ⚡ {plan.urgencia}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.nome}</h3>
                  {"precoOriginal" in plan && plan.precoOriginal && (
                    <p className="text-slate-500 text-sm line-through mb-0.5">{plan.precoOriginal}</p>
                  )}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-black text-white">{plan.preco}</span>
                    <span className="text-slate-400 text-sm">{plan.periodo}</span>
                    {"precoOriginal" in plan && plan.precoOriginal && (
                      <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">-50%</span>
                    )}
                  </div>
                  {"equiv" in plan && plan.equiv && (
                    <p className="text-cyan-400 text-xs font-mono mb-1">{plan.equiv}</p>
                  )}
                  <p className="text-slate-400 text-sm">{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.recursos.map((r, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {r}
                    </li>
                  ))}
                </ul>

                <CaktoCheckoutButton plano={plan.plano} variant={plan.variant} className="w-full justify-center" />
              </motion.div>
            ))}
          </div>

          {/* guarantee card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 border border-slate-700 rounded-2xl p-6 bg-slate-900/60 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
          >
            <div className="text-4xl shrink-0">🛡️</div>
            <div>
              <h4 className="text-white font-bold mb-1">Garantia de 7 dias — sem risco nenhum</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Se por qualquer motivo você não gostar do Ascend System nos primeiros 7 dias, devolvemos 100% do valor. Sem formulários complicados, sem burocracia.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-3">Dúvidas</p>
            <h2 className="text-4xl font-black mb-4">Perguntas <span className="text-violet-400">frequentes</span></h2>
          </motion.div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-slate-900/60 hover:bg-slate-900/80 transition-colors"
                  aria-expanded={faqOpen === i}
                >
                  <span className="text-white font-semibold text-sm">{item.q}</span>
                  <svg
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${faqOpen === i ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden bg-slate-900/40"
                    >
                      <p className="px-5 py-4 text-slate-400 text-sm leading-relaxed border-t border-slate-800">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <AnimatedBackground intensity="medium" className="opacity-40" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto text-center space-y-8"
        >
          <h2 className="text-5xl font-black leading-tight">
            Sua jornada começa{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">agora.</span>
          </h2>
          <p className="text-xl text-slate-300">
            Cada dia sem o sistema é um dia de EXP perdido. Ative seu acesso e comece a ascender.
          </p>
          <div className="flex flex-col items-center gap-3">
            <CaktoCheckoutButton
              plano="anual"
              label="Desbloquear acesso premium"
              variant="primary"
              className="text-base px-10 py-4"
            />
            <Link
              href="#planos"
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors underline underline-offset-4"
            >
              Ou ver todos os planos, incluindo Fundador →
            </Link>
          </div>
          <p className="text-slate-500 text-xs">Garantia de 7 dias · Suporte por e-mail · Sem mensalidade surpresa</p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 py-10 px-6 text-center">
        <p className="text-slate-300 font-bold mb-1">Ascend System</p>
        <p className="text-slate-500 text-sm mb-4">© 2026 Todos os direitos reservados.</p>
        <div className="flex flex-wrap justify-center gap-6 text-slate-500 text-sm">
          <Link href="/login"    className="hover:text-slate-300 transition-colors">Entrar</Link>
          <Link href="/register" className="hover:text-slate-300 transition-colors">Criar conta</Link>
          <Link href="/privacy"  className="hover:text-slate-300 transition-colors">Privacidade</Link>
          <Link href="/terms"    className="hover:text-slate-300 transition-colors">Termos de Uso</Link>
        </div>
        <p className="text-slate-700 text-xs mt-6">
          Ascend System é um produto de software de gamificação pessoal. Resultados dependem do uso consistente da plataforma.
        </p>
      </footer>
    </main>
  );
}
