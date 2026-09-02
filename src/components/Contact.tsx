// src/components/Contact.tsx
// sopa.team/contato port: terminal-styled brief form + short LLM follow-up chat.
import { useEffect, useRef, useState } from 'react';

// pill options are [en, pt] pairs — same value submitted either way
const TYPES = [
  { en: 'digital presence', pt: 'presença digital' },
  { en: 'site / landing', pt: 'site / landing' },
  { en: 'identity', pt: 'identidade' },
  { en: 'campaign', pt: 'campanha' },
  { en: 'community', pt: 'comunidade' },
  { en: 'digital product', pt: 'produto digital' },
];
const BUDGETS = [
  { en: 'under 5k', pt: 'até 5k' },
  { en: '5–15k', pt: '5–15k' },
  { en: '15–40k', pt: '15–40k' },
  { en: '40k+', pt: '40k+' },
  { en: 'TBD', pt: 'a definir' },
];
const DEADLINES = [
  { en: 'no rush', pt: 'sem pressa' },
  { en: '1 month', pt: '1 mês' },
  { en: 'this quarter', pt: 'este trimestre' },
  { en: 'yesterday', pt: 'ontem' },
];
const MAX_TURNS = 3;

type Turn = { role: 'user' | 'assistant'; content: string };

const LABELS = {
  en: {
    name: 'name / collective', namePh: 'who\'s calling',
    email: 'email / @', emailPh: 'so we can reply',
    whatIs: 'what is it — mark as many as apply',
    budget: 'budget', deadline: 'deadline',
    tellMore: 'tell us more',
    msgPh: 'the project, the vibe, references, links to what already exists...',
  },
  pt: {
    name: 'nome / coletivo', namePh: 'quem tá chamando',
    email: 'email / @', emailPh: 'pra gente responder',
    whatIs: 'o que é — pode marcar mais de um',
    budget: 'orçamento', deadline: 'prazo',
    tellMore: 'conta mais',
    msgPh: 'o projeto, a vibe, referências, links do que já existe...',
  },
} as const;

function Pill({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        on ? 'border-amber-300 bg-amber-300/10 text-amber-200' : 'border-white/20 text-white/50 hover:border-white/40'
      }`}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] text-white/40">{label}</div>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-amber-300 focus:outline-none';

export default function Contact({ title, locale }: { title?: string; locale: string }) {
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.en;
  const [llm, setLlm] = useState(false);
  useEffect(() => {
    fetch('/api/contact/config').then(r => r.json()).then(d => setLlm(Boolean(d.llm))).catch(() => setLlm(false));
  }, []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [budget, setBudget] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'chat' | 'done' | 'error'>('idle');
  const [turn, setTurn] = useState(0);
  const [chat, setChat] = useState<Turn[]>([]);
  const [followUp, setFollowUp] = useState('');
  const chatEnd = useRef<HTMLDivElement>(null);

  // fire-and-forget lead log: name+email identify, message appends to history
  const logLead = (message: string) => {
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email,
        message, role: 'user', locale,
        types: [...types].join(', '),
        budget, deadline,
      }),
    }).catch(() => {});
  };

  const briefPayload = (message: string) => ({
    name,
    email,
    message,
    locale,
    types: [...types].join(', '),
    budget,
    deadline,
    turn,
    // server already re-sends the brief as its own user turn — don't duplicate it in history
    history: chat.slice(1),
  });

  async function callBot(message: string) {
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(briefPayload(message)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'erro');
      setTurn((t) => t + 1);
      setChat((c) => [...c, { role: 'assistant', content: data.reply ?? '' }]);
      if (data.reply) {
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message: data.reply, role: 'assistant', locale }),
        }).catch(() => {});
      }
      // bot decides when it's done — turn cap is only a safety net
      if (data.done || data.status === 'complete') setStatus('done');
      else setStatus('chat');
      setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch {
      setStatus('error');
    }
  }

  // "talk to our agent" — sends the current form as the starting brief;
  // the bot then engages if something critical is missing
  async function startChat() {
    const text = msg.trim() || (locale === 'pt' ? 'quero conversar sobre um projeto' : 'I want to talk about a project');
    setChat([{ role: 'user', content: text }]);
    logLead(text);
    await callBot(text);
    setMsg('');
  }

  // "send brief" — save the lead, no bot conversation
  function sendBrief(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !msg.trim()) return;
    setStatus('sending');
    logLead(msg);
    setTimeout(() => setStatus('done'), 400);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = msg.trim() || (locale === 'pt' ? 'quero conversar sobre um projeto' : 'I want to talk about a project');
    setChat([{ role: 'user', content: text }]);
    await callBot(text);
  }

  async function sendFollowUp(e: React.FormEvent) {
    e.preventDefault();
    if (!followUp.trim()) return;
    const next = [...chat, { role: 'user' as const, content: followUp }];
    setChat(next);
    setFollowUp('');
    // reuse payload with last user message as `message`
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...briefPayload(followUp), message: followUp, history: next.slice(1, -1), turn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'erro');
      setTurn((t) => t + 1);
      setChat([...next, { role: 'assistant', content: data.reply ?? '' }]);
      if (data.reply) {
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message: data.reply, role: 'assistant', locale }),
        }).catch(() => {});
      }
      if (turn + 1 >= MAX_TURNS || data.done || data.status === 'complete') setStatus('done');
      setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch {
      // keep the user bubble; surface the fallback line
      setChat(next);
      setStatus('error');
    }
  }

  function reset() {
    setStatus('idle');
    setTurn(0);
    setChat([]);
    setMsg('');
    setFollowUp('');
  }

  const toggleType = (t: string) => {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-2 page-title-anim">{title}</h2>
      <p className="mb-6 opacity-70 page-title-anim page-title-anim-d1">
        {locale === 'pt'
          ? 'Descreva o projeto em linhas gerais. Nosso agente ajuda a definir o escopo.'
          : 'Describe the project in broad strokes. Our agent can help you build your project scope.'}
      </p>


      <form
        className="page-anim rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-sm md:p-8"
        onSubmit={sendBrief}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={L.name}>
            <input className={inputCls} placeholder={L.namePh} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={L.email}>
            <input className={inputCls} type="email" placeholder={L.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>

        <div className="mt-6">
          <div className="mb-2 text-[11px] text-white/40">{L.whatIs}</div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <Pill key={t.pt} label={t[locale as 'en' | 'pt']} on={types.has(t.pt)} onClick={() => toggleType(t.pt)} />
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[11px] text-white/40">{L.budget}</div>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <Pill key={b.pt} label={b[locale as 'en' | 'pt']} on={budget === b.pt} onClick={() => setBudget(budget === b.pt ? null : b.pt)} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[11px] text-white/40">{L.deadline}</div>
            <div className="flex flex-wrap gap-2">
              {DEADLINES.map((d) => (
                <Pill key={d.pt} label={d[locale as 'en' | 'pt']} on={deadline === d.pt} onClick={() => setDeadline(deadline === d.pt ? null : d.pt)} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Field label={L.tellMore}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-2.5 font-mono text-sm text-amber-300">&gt;</span>
              <textarea
                className={`${inputCls} pl-7 leading-relaxed`}
                rows={4}
                placeholder={L.msgPh}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
              />
            </div>
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-white/30">
                      {status === 'error'
                        ? (locale === 'pt'
                            ? '● nossos agentes estão ocupados agora, mas relaxa — seu contato foi salvo e a gente lê e responde o mais rápido possível.'
                            : '● our agents are busy right now, but don\'t worry — your message was saved and we\'ll read and reply asap.')
                        : status === 'idle'
                        ? (locale === 'pt'
                            ? 'a gente lê o brief inteiro antes de responder.'
                            : 'we read the full brief before replying.')
                        : ''}
                    </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={status === 'sending' || status !== 'idle'}
              className="rounded-lg bg-amber-300 px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:bg-amber-200 disabled:opacity-60"
            >
              {status === 'sending'
                ? (locale === 'pt' ? 'enviando…' : 'sending…')
                : locale === 'pt'
                ? 'enviar brief →'
                : 'send brief →'}
            </button>
            {llm && (
            <button
              type="button"
              onClick={startChat}
              disabled={status !== 'idle'}
              className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white disabled:opacity-60"
            >
              {locale === 'pt' ? 'falar com nosso agente' : 'talk to our agent'}
            </button>
            )}
          </div>
        </div>
      </form>

      {/* brief-only submission: no bot, just confirmation */}
      {status === 'done' && chat.length === 0 && (
        <div className="mt-4 rounded-xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm page-anim">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-amber-200">
              ● {locale === 'pt' ? 'Brief recebido. Nossos agentes respondem em breve 🤙' : 'Brief received. Our agents will reply soon 🤙'}
            </span>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg bg-amber-300 px-5 py-2 text-xs font-semibold text-black transition-opacity hover:bg-amber-200"
            >
              {locale === 'pt' ? 'fechar ✓' : 'close ✓'}
            </button>
          </div>
        </div>
      )}

      {status !== 'idle' && status !== 'error' && chat.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm page-anim">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
                      {'>'} {locale === 'pt' ? 'bot de plantão' : 'on-duty bot'} · turno {Math.min(turn, MAX_TURNS)}/{MAX_TURNS}
                    </div>
          <div className="space-y-3 max-h-96 overflow-y-auto text-xs leading-relaxed">
            {chat.map((m, i) => (
              <div key={i} className={m.role === 'assistant' ? 'whitespace-pre-wrap text-white/80' : 'text-right'}>
                <span className={m.role === 'user' ? 'inline-block rounded-lg bg-amber-300/10 px-3 py-2 text-left whitespace-pre-wrap text-white/70' : ''}>
                  {m.content}
                </span>
              </div>
            ))}
            {status === 'sending' && <div className="animate-pulse text-white/30">digitando…</div>}
            <div ref={chatEnd} />
          </div>

          {status === 'done' ? (
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-[11px] text-amber-200">● Beleza, temos tudo — a gente entra em contato em breve 🤙</span>
              <button
                type="button"
                onClick={reset}
                className="rounded-lg bg-amber-300 px-5 py-2 text-xs font-semibold text-black transition-opacity hover:bg-amber-200"
              >
                fechar ✓
              </button>
            </div>
          ) : (
            <form onSubmit={sendFollowUp} className="mt-4 flex gap-2">
              <input
                className={inputCls}
                placeholder="responde o bot…"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                disabled={status === 'sending'}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="shrink-0 rounded-lg bg-amber-300 px-4 py-2 text-xs font-semibold text-black transition-opacity hover:bg-amber-200 disabled:opacity-60"
              >
                enviar →
              </button>
            </form>
          )}
        </div>
      )}

      {/* Network Links Grid */}
      <div className="mt-16 page-anim">
        <h3 className="text-lg font-semibold mb-4 text-center">
          {locale === 'pt' ? 'Conectar / Rede' : 'Connect / Network'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              name: 'Farcaster', 
              url: 'https://warpcast.com/~/channel/gnars', 
              icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path d="M18.24.24H5.76A5.52 5.52 0 0 0 .24 5.76v12.48a5.52 5.52 0 0 0 5.52 5.52h12.48a5.52 5.52 0 0 0 5.52-5.52V5.76a5.52 5.52 0 0 0-5.52-5.52Zm-2.88 15.6a.72.72 0 0 1-1.03.11l-2.33-1.9v4.27a.72.72 0 1 1-1.44 0v-4.27l-2.33 1.9a.72.72 0 1 1-.92-1.12l3.41-2.77H6.96a.72.72 0 1 1 0-1.44h8.88v-.48h-8.4a.72.72 0 1 1 0-1.44h8.4v-.48H5.76a.72.72 0 1 1 0-1.44h10.08v-.24c0-2.38-1.94-4.32-4.32-4.32a.72.72 0 1 1 0-1.44c3.18 0 5.76 2.58 5.76 5.76v1.92h.96a.72.72 0 1 1 0 1.44h-.96v.48h1.44a.72.72 0 1 1 0 1.44h-1.44v.48h.48a.72.72 0 1 1 0 1.44h-4.31l3.41 2.77a.72.72 0 0 1 .11 1.03Z" fill="currentColor"/>
                </svg>
              ) 
            },
            { 
              name: 'Instagram', 
              url: 'https://www.instagram.com/sopa_agency/', 
              icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              ) 
            },
            { 
              name: 'GitHub', 
              url: 'https://github.com/sopa-agency', 
              icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              ) 
            },
            { 
              name: 'Email', 
              url: 'mailto:crew@sopa.team', 
              icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                </svg>
              ) 
            }
          ].map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center justify-center p-4 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm transition-all duration-500 hover:bg-black/60 hover:border-white/30"
            >
              <span className="text-xl mb-2">{link.icon}</span>
              <span className="text-sm text-white/80">{link.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* cross-links to Work and Solutions */}
      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        {([
          { href: '/work', title: { en: 'See Our Work', pt: 'Veja Nosso Trabalho' }, sub: { en: 'Projects in production — agents, portals, onchain.', pt: 'Projetos em produção — agentes, portais, onchain.' } },
          { href: '/solutions', title: { en: 'Explore Solutions', pt: 'Explore as Soluções' }, sub: { en: 'AI, campaigns, tooling and onchain revenue.', pt: 'IA, campanhas, ferramentas e receita onchain.' } },
        ] as const).map(c => (
          <a
            key={c.href}
            href={`/${locale}${c.href}`}
            onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('sopa:navigate', { detail: c.href.slice(1) })); }}
            className="group rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md p-6 hover:border-amber-300/40 transition-colors"
          >
            <h3 className="text-lg font-semibold group-hover:text-amber-200 transition-colors">
              {c.title[locale as keyof typeof c.title]} <span className="text-amber-300">→</span>
            </h3>
            <p className="mt-2 text-sm text-white/60">{c.sub[locale as keyof typeof c.sub]}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
