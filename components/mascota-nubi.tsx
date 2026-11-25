'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

const WHATSAPP = 'https://wa.me/5491164157261'
const IDLE_MS = 30000

type Mood = 'hello' | 'think' | 'cheer' | 'ai' | 'shield' | 'bolt' | 'question' | 'chat'

type Stage = { id: string; mood: Mood; msg: string; cta?: boolean }

// Un estado de ánimo + mensaje por cada sección de la landing.
const STAGES: Stage[] = [
  { id: 'inicio', mood: 'hello', msg: '¡Hola! Soy Nubi. Te acompaño mientras recorrés la web.' },
  { id: 'soluciones', mood: 'think', msg: 'Acá contamos qué problemas concretos resolvemos.' },
  { id: 'clientes', mood: 'cheer', msg: 'Casos reales, con clientes reales.' },
  { id: 'servicios', mood: 'ai', msg: 'IA y soporte IT para que tu equipo rinda más.' },
  { id: 'seguridad', mood: 'shield', msg: 'Tus datos no viven en una notebook. Están a resguardo.' },
  { id: 'valor', mood: 'bolt', msg: 'Menos hardware, más productividad.' },
  { id: 'faq', mood: 'question', msg: '¿Dudas? Mirá las más comunes.' },
  { id: 'contacto', mood: 'chat', msg: '¿Hablamos? Respondemos en menos de 24 h hábiles.', cta: true },
]

const HAPPY: Mood[] = ['cheer', 'bolt', 'chat']

export default function MascotaNubi() {
  const [stage, setStage] = useState<Stage>(STAGES[0])
  const [asleep, setAsleep] = useState(false)
  const [joy, setJoy] = useState(false)
  const [blink, setBlink] = useState(false)
  const [lean, setLean] = useState<'up' | 'down' | ''>('')
  const [bubble, setBubble] = useState<{ text: string; cta: boolean } | null>(null)

  const btnRef = useRef<HTMLButtonElement>(null)
  const eyesRef = useRef<SVGGElement>(null)
  const seen = useRef(new Set<string>())
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const closeBubble = useCallback(() => {
    clearTimeout(hideTimer.current)
    setBubble(null)
  }, [])

  const showBubble = useCallback((text: string, cta: boolean, autoHide = true) => {
    clearTimeout(hideTimer.current)
    setBubble({ text, cta })
    if (autoHide) hideTimer.current = setTimeout(() => setBubble(null), 7000)
  }, [])

  // 1) Detecta qué sección está en el centro de la pantalla.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const next = STAGES.find((s) => s.id === entry.target.id)
          if (next) setStage(next)
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )
    STAGES.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // 2) Al entrar a una sección nueva, dice algo (una sola vez por sección).
  useEffect(() => {
    if (seen.current.has(stage.id)) return
    const t = setTimeout(() => {
      seen.current.add(stage.id)
      showBubble(stage.msg, !!stage.cta)
    }, 1400)
    return () => clearTimeout(t)
  }, [stage, showBubble])

  // 3) Parpadeo aleatorio.
  useEffect(() => {
    if (asleep) return
    let t: ReturnType<typeof setTimeout>
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true)
        setTimeout(() => setBlink(false), 140)
        loop()
      }, 2500 + Math.random() * 3000)
    }
    loop()
    return () => clearTimeout(t)
  }, [asleep])

  // 4) Los ojos siguen el cursor.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const btn = btnRef.current
        const eyes = eyesRef.current
        if (!btn || !eyes) return
        const r = btn.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const d = Math.hypot(dx, dy) || 1
        const k = Math.min(1, d / 220)
        eyes.style.setProperty('--ex', `${(dx / d) * 3.2 * k}px`)
        eyes.style.setProperty('--ey', `${(dy / d) * 2.6 * k}px`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  // 5) Se inclina al scrollear y se duerme si no hacés nada.
  useEffect(() => {
    let lastY = window.scrollY
    let leanTimer: ReturnType<typeof setTimeout>
    let idleTimer: ReturnType<typeof setTimeout>

    const resetIdle = () => {
      setAsleep(false)
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => setAsleep(true), IDLE_MS)
    }
    const onScroll = () => {
      const y = window.scrollY
      if (Math.abs(y - lastY) > 4) setLean(y > lastY ? 'down' : 'up')
      lastY = y
      clearTimeout(leanTimer)
      leanTimer = setTimeout(() => setLean(''), 180)
      resetIdle()
    }
    const events = ['pointermove', 'pointerdown', 'keydown', 'touchstart'] as const
    events.forEach((ev) => window.addEventListener(ev, resetIdle, { passive: true }))
    window.addEventListener('scroll', onScroll, { passive: true })
    resetIdle()
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetIdle))
      window.removeEventListener('scroll', onScroll)
      clearTimeout(leanTimer)
      clearTimeout(idleTimer)
    }
  }, [])

  // 6) Escape cierra el globo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeBubble()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeBubble])

  const onClick = () => {
    setJoy(true)
    setTimeout(() => setJoy(false), 900)
    if (bubble?.cta) return closeBubble()
    showBubble('¿Querés hablar con una persona? Escribinos por WhatsApp.', true, false)
  }

  const mood = stage.mood
  const happy = joy || HAPPY.includes(mood)
  const mouth = asleep
    ? 'sleep'
    : joy || mood === 'cheer' || mood === 'bolt' || mood === 'chat'
      ? 'open'
      : mood === 'think'
        ? 'tilt'
        : mood === 'shield'
          ? 'flat'
          : mood === 'question'
            ? 'wavy'
            : 'smile'

  return (
    <div className="nubi" data-mood={mood} data-asleep={asleep} data-joy={joy} data-lean={lean}>
      {bubble && (
        <div className="nubi-bubble" role="status">
          <button type="button" className="nubi-bubble-x" onClick={closeBubble} aria-label="Cerrar mensaje">
            <X size={14} />
          </button>
          <p>{bubble.text}</p>
          {bubble.cta && (
            <a className="nubi-cta" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} /> Abrir WhatsApp
            </a>
          )}
        </div>
      )}

      <button
        ref={btnRef}
        type="button"
        className="nubi-btn"
        onClick={onClick}
        aria-label="Nubi, la mascota de IncloudIA. Abrir opciones de contacto"
        aria-expanded={!!bubble?.cta}
      >
        <svg viewBox="0 0 120 100" width="100%" height="100%" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="nubi-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#bfe3ff" />
            </linearGradient>
          </defs>

          <ellipse className="nubi-shadow" cx="60" cy="93" rx="30" ry="4" />

          <g className="nubi-body">
            {/* Props según la sección */}
            {mood === 'ai' && (
              <g className="prop prop-antenna">
                <line x1="62" y1="14" x2="62" y2="3" stroke="#bfe3ff" strokeWidth="2.5" strokeLinecap="round" />
                <circle className="blink-light" cx="62" cy="1" r="4.5" fill="#4db8ff" />
              </g>
            )}
            {mood === 'think' && (
              <g className="prop prop-think" fill="#f2f6fa">
                <circle cx="96" cy="14" r="2.2" />
                <circle cx="103" cy="7" r="3.2" />
                <ellipse cx="116" cy="-4" rx="13" ry="9" />
                <g fill="#071426">
                  <circle cx="110" cy="-4" r="1.8" />
                  <circle cx="116" cy="-4" r="1.8" />
                  <circle cx="122" cy="-4" r="1.8" />
                </g>
              </g>
            )}
            {mood === 'question' && (
              <text className="prop prop-q" x="98" y="12" fontSize="30" fontWeight="800" fill="#4db8ff" fontFamily="system-ui, sans-serif">
                ?
              </text>
            )}
            {mood === 'bolt' && (
              <path className="prop prop-bolt" d="M98 -4 L84 22 H95 L90 40 L110 13 H98 Z" fill="#ffd166" />
            )}
            {mood === 'cheer' && (
              <g className="prop prop-stars" fill="#ffd166">
                <path className="twinkle t1" d="M8 14 l2.6 6 6.4 .6 -4.8 4.2 1.5 6.3 -5.7 -3.4 -5.7 3.4 1.5 -6.3 -4.8 -4.2 6.4 -.6z" />
                <path className="twinkle t2" d="M108 4 l2 4.6 5 .5 -3.7 3.3 1.1 4.9 -4.4 -2.6 -4.4 2.6 1.1 -4.9 -3.7 -3.3 5 -.5z" />
              </g>
            )}
            {mood === 'chat' && (
              <g className="prop prop-chat">
                <rect x="88" y="-6" width="30" height="22" rx="9" fill="#25d366" />
                <path d="M96 15 l-4 8 10 -7z" fill="#25d366" />
                <g fill="#fff">
                  <circle cx="97" cy="5" r="2.2" />
                  <circle cx="103" cy="5" r="2.2" />
                  <circle cx="109" cy="5" r="2.2" />
                </g>
              </g>
            )}

            {/* Brazos */}
            <g className={`arm arm-l ${happy ? 'up' : ''}`}>
              <ellipse cx="12" cy="68" rx="9" ry="6" fill="#d3ecff" />
            </g>
            <g className={`arm arm-r ${happy ? 'up' : ''} ${mood === 'hello' && !asleep ? 'wave' : ''}`}>
              <ellipse cx="108" cy="68" rx="9" ry="6" fill="#d3ecff" />
            </g>

            {/* Cuerpo de nube */}
            <g fill="url(#nubi-fill)">
              <circle cx="38" cy="58" r="20" />
              <circle cx="62" cy="40" r="26" />
              <circle cx="86" cy="56" r="20" />
              <rect x="22" y="58" width="80" height="26" rx="13" />
            </g>

            {mood === 'shield' && (
              <g className="prop prop-shield">
                <path d="M96 56 l15 5 v11 c0 10 -7 15 -15 19 c-8 -4 -15 -9 -15 -19 v-11z" fill="#4db8ff" stroke="#071426" strokeWidth="2" strokeLinejoin="round" />
                <path d="M89 73 l5 5 l10 -11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}

            {/* Cara */}
            <circle cx="36" cy="67" r="5" fill="#4db8ff" opacity=".4" />
            <circle cx="84" cy="67" r="5" fill="#4db8ff" opacity=".4" />

            <g ref={eyesRef} className={`eyes ${blink ? 'blink' : ''}`}>
              {asleep ? (
                <g fill="none" stroke="#071426" strokeWidth="3" strokeLinecap="round">
                  <path d="M41 60 Q46 65 51 60" />
                  <path d="M69 60 Q74 65 79 60" />
                </g>
              ) : happy ? (
                <g fill="none" stroke="#071426" strokeWidth="3.2" strokeLinecap="round">
                  <path d="M41 62 Q46 54 51 62" />
                  <path d="M69 62 Q74 54 79 62" />
                </g>
              ) : (
                <g fill="#071426">
                  <ellipse className="eye" cx="46" cy="58" rx="5.2" ry="6.8" />
                  <ellipse className="eye" cx="74" cy="58" rx="5.2" ry="6.8" />
                  <circle cx="47.8" cy="55.5" r="1.8" fill="#fff" />
                  <circle cx="75.8" cy="55.5" r="1.8" fill="#fff" />
                </g>
              )}
            </g>

            {mood === 'shield' && !asleep && (
              <g stroke="#071426" strokeWidth="2.6" strokeLinecap="round">
                <line x1="39" y1="46" x2="52" y2="49" />
                <line x1="81" y1="46" x2="68" y2="49" />
              </g>
            )}

            {mouth === 'smile' && <path d="M54 70 Q60 76 66 70" fill="none" stroke="#071426" strokeWidth="3" strokeLinecap="round" />}
            {mouth === 'open' && <path d="M52 69 Q60 83 68 69 Z" fill="#071426" strokeLinejoin="round" stroke="#071426" strokeWidth="2" />}
            {mouth === 'tilt' && <path d="M55 73 L66 70" fill="none" stroke="#071426" strokeWidth="3" strokeLinecap="round" />}
            {mouth === 'flat' && <path d="M55 72 L65 72" fill="none" stroke="#071426" strokeWidth="3" strokeLinecap="round" />}
            {mouth === 'wavy' && <path d="M53 72 Q56.5 68 60 72 T67 72" fill="none" stroke="#071426" strokeWidth="2.8" strokeLinecap="round" />}
            {mouth === 'sleep' && <ellipse cx="60" cy="72" rx="3" ry="3.6" fill="#071426" />}
          </g>

          {asleep && (
            <g className="zzz" fill="#8b9cb0" fontFamily="system-ui, sans-serif" fontWeight="800">
              <text className="z1" x="96" y="20" fontSize="14">z</text>
              <text className="z2" x="104" y="8" fontSize="18">z</text>
              <text className="z3" x="114" y="-6" fontSize="22">Z</text>
            </g>
          )}
        </svg>
      </button>
    </div>
  )
}
