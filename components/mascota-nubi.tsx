'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

const WHATSAPP = 'https://wa.me/5491164157261'
const IDLE_MS = 30000

type Mood = 'hello' | 'think' | 'cheer' | 'ai' | 'shield' | 'bolt' | 'question' | 'chat'
type Act = 'spin' | 'dance' | 'rain' | 'rainbow' | 'sneeze' | 'look'
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

// Acciones que hace sola de vez en cuando.
const ACTS: { name: Act; ms: number }[] = [
  { name: 'spin', ms: 1000 },
  { name: 'dance', ms: 2800 },
  { name: 'rain', ms: 3200 },
  { name: 'rainbow', ms: 3400 },
  { name: 'sneeze', ms: 1400 },
  { name: 'look', ms: 2600 },
]

const HAPPY: Mood[] = ['cheer', 'bolt', 'chat']
const RAINBOW = ['#ff6b6b', '#ffd166', '#5ee0a0', '#4db8ff']
const CONFETTI: [number, string][] = [
  [22, '#ffd166'], [36, '#ff7a90'], [50, '#5ee0a0'], [64, '#4db8ff'], [78, '#ffd166'], [92, '#ff7a90'], [104, '#5ee0a0'],
]
const PUFFS: [number, number][] = [[-34, 6], [34, 6], [-18, 16], [20, 16], [0, 20]]
const SPIRAL = 'M0 0 a1.2 1.2 0 0 1 2.4 0 a2.4 2.4 0 0 1 -4.8 0 a3.6 3.6 0 0 1 7.2 0 a4.8 4.8 0 0 1 -9.6 0'

const cssVars = (v: Record<string, string>) => v as React.CSSProperties

export default function MascotaNubi() {
  const [stage, setStage] = useState<Stage>(STAGES[0])
  const [asleep, setAsleep] = useState(false)
  const [joy, setJoy] = useState(false)
  const [blink, setBlink] = useState(false)
  const [lean, setLean] = useState<'up' | 'down' | ''>('')
  const [bubble, setBubble] = useState<{ text: string; cta: boolean } | null>(null)
  const [typed, setTyped] = useState('')
  const [act, setAct] = useState<Act | null>(null)
  const [hover, setHover] = useState(false)
  const [dizzy, setDizzy] = useState(false)
  const [wake, setWake] = useState(false)
  const [puff, setPuff] = useState(false)

  const btnRef = useRef<HTMLButtonElement>(null)
  const eyesRef = useRef<SVGGElement>(null)
  const seen = useRef(new Set<string>())
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const clicks = useRef<number[]>([])
  const prevStage = useRef(STAGES[0].id)
  const wasAsleep = useRef(false)

  const closeBubble = useCallback(() => {
    clearTimeout(hideTimer.current)
    setBubble(null)
  }, [])

  const showBubble = useCallback((text: string, cta: boolean, autoHide = true) => {
    clearTimeout(hideTimer.current)
    setBubble({ text, cta })
    if (autoHide) hideTimer.current = setTimeout(() => setBubble(null), 7500)
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

  // 2) Al cambiar de sección: voltereta + nubecitas, y dice algo (una vez por sección).
  useEffect(() => {
    if (prevStage.current === stage.id) return
    prevStage.current = stage.id
    setPuff(true)
    setAct('spin')
    const a = setTimeout(() => setPuff(false), 900)
    const b = setTimeout(() => setAct((x) => (x === 'spin' ? null : x)), 1000)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [stage])

  useEffect(() => {
    if (seen.current.has(stage.id)) return
    const t = setTimeout(() => {
      seen.current.add(stage.id)
      showBubble(stage.msg, !!stage.cta)
    }, 1400)
    return () => clearTimeout(t)
  }, [stage, showBubble])

  // 3) Efecto máquina de escribir en el globo (y la boca "habla" mientras tanto).
  useEffect(() => {
    if (!bubble) {
      setTyped('')
      return
    }
    const full = bubble.text
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(full)
      return
    }
    let i = 0
    setTyped('')
    const iv = setInterval(() => {
      i += 1
      setTyped(full.slice(0, i))
      if (i >= full.length) clearInterval(iv)
    }, 24)
    return () => clearInterval(iv)
  }, [bubble?.text]) // eslint-disable-line react-hooks/exhaustive-deps

  // 4) Parpadeo aleatorio.
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

  // 5) Acciones espontáneas: baila, llueve, hace arcoíris, estornuda, mira alrededor...
  useEffect(() => {
    if (asleep) return
    let cancelled = false
    let t: ReturnType<typeof setTimeout>
    let end: ReturnType<typeof setTimeout>
    const schedule = () => {
      t = setTimeout(() => {
        if (cancelled) return
        const pick = ACTS[Math.floor(Math.random() * ACTS.length)]
        setAct(pick.name)
        end = setTimeout(() => {
          if (cancelled) return
          setAct(null)
          schedule()
        }, pick.ms)
      }, 6000 + Math.random() * 5000)
    }
    schedule()
    return () => {
      cancelled = true
      clearTimeout(t)
      clearTimeout(end)
      setAct(null)
    }
  }, [asleep])

  // 6) Los ojos siguen el cursor.
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

  // 7) Se inclina al scrollear y se duerme si no hacés nada.
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

  // 8) Al despertar se sobresalta.
  useEffect(() => {
    if (wasAsleep.current && !asleep) {
      setWake(true)
      const t = setTimeout(() => setWake(false), 900)
      wasAsleep.current = asleep
      return () => clearTimeout(t)
    }
    wasAsleep.current = asleep
  }, [asleep])

  // 9) Escape cierra el globo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeBubble()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeBubble])

  const onClick = () => {
    // 5 clics rápidos: se maréa.
    const now = Date.now()
    clicks.current = [...clicks.current.filter((t) => now - t < 3000), now]
    if (clicks.current.length >= 5) {
      clicks.current = []
      closeBubble()
      setDizzy(true)
      setTimeout(() => setDizzy(false), 2800)
      return
    }
    setJoy(true)
    setTimeout(() => setJoy(false), 1100)
    if (bubble?.cta) return closeBubble()
    showBubble('¿Querés hablar con una persona? Escribinos por WhatsApp.', true, false)
  }

  const mood = stage.mood
  const talking = !!bubble && typed.length < bubble.text.length && !asleep
  const closedEyes = asleep || act === 'sneeze'
  const happy =
    !dizzy && !closedEyes &&
    (joy || hover || act === 'dance' || act === 'rain' || act === 'rainbow' || HAPPY.includes(mood))
  const armsUp = happy || act === 'dance'
  const mouth = asleep
    ? 'sleep'
    : dizzy
      ? 'wavy'
      : talking
        ? 'talk'
        : act === 'sneeze' || joy || hover || act === 'dance' || act === 'rain' || act === 'rainbow' || HAPPY.includes(mood)
          ? 'open'
          : mood === 'think'
            ? 'tilt'
            : mood === 'shield'
              ? 'flat'
              : mood === 'question'
                ? 'wavy'
                : 'smile'

  return (
    <div
      className="nubi"
      data-mood={mood}
      data-asleep={asleep}
      data-joy={joy}
      data-lean={lean}
      data-act={act ?? ''}
      data-dizzy={dizzy}
      data-wake={wake}
    >
      {bubble && (
        <div className="nubi-bubble" role="status">
          <button type="button" className="nubi-bubble-x" onClick={closeBubble} aria-label="Cerrar mensaje">
            <X size={14} />
          </button>
          <p>
            <span className="sr-only">{bubble.text}</span>
            <span className="ghost" aria-hidden="true">{bubble.text}</span>
            <span className="typed" aria-hidden="true">{typed}</span>
          </p>
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
        onPointerEnter={(e) => e.pointerType !== 'touch' && setHover(true)}
        onPointerLeave={() => setHover(false)}
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
            {/* Detrás del cuerpo */}
            {act === 'rainbow' && (
              <g fill="none" strokeWidth="4" strokeLinecap="round">
                {RAINBOW.map((c, i) => {
                  const r = 70 - i * 5
                  return (
                    <path
                      key={c}
                      className="rb"
                      d={`M${60 - r} 72 A${r} ${r} 0 0 1 ${60 + r} 72`}
                      stroke={c}
                      pathLength={1}
                      style={{ animationDelay: `${i * 0.14}s` }}
                    />
                  )
                })}
              </g>
            )}

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
                <g className="tdots" fill="#071426">
                  <circle cx="110" cy="-4" r="1.8" />
                  <circle cx="116" cy="-4" r="1.8" />
                  <circle cx="122" cy="-4" r="1.8" />
                </g>
                <g className="bulb">
                  <circle cx="116" cy="-6" r="6" fill="#ffd166" />
                  <rect x="113.5" y="0" width="5" height="3" rx="1" fill="#c9a24a" />
                </g>
              </g>
            )}
            {mood === 'question' && (
              <g fontFamily="system-ui, sans-serif" fontWeight="800" fill="#4db8ff">
                <text className="prop prop-q" x="98" y="12" fontSize="30">?</text>
                <text className="prop prop-q q2" x="86" y="-6" fontSize="16" opacity=".7">?</text>
                <text className="prop prop-q q3" x="112" y="-8" fontSize="12" opacity=".55">?</text>
              </g>
            )}
            {mood === 'bolt' && (
              <g>
                <path className="prop prop-bolt" d="M98 -4 L84 22 H95 L90 40 L110 13 H98 Z" fill="#ffd166" />
                <circle className="spark" cx="80" cy="4" r="2" fill="#ffd166" />
                <circle className="spark s2" cx="116" cy="0" r="2.4" fill="#ffd166" />
              </g>
            )}
            {mood === 'chat' && (
              <g className="prop prop-chat">
                <rect x="88" y="-6" width="30" height="22" rx="9" fill="#25d366" />
                <path d="M96 15 l-4 8 10 -7z" fill="#25d366" />
                <g fill="#fff">
                  <circle className="dot" cx="97" cy="5" r="2.2" />
                  <circle className="dot d2" cx="103" cy="5" r="2.2" />
                  <circle className="dot d3" cx="109" cy="5" r="2.2" />
                </g>
              </g>
            )}

            {/* Brazos */}
            <g className={`arm arm-l ${armsUp ? 'up' : ''} ${act === 'dance' ? 'dance' : ''}`}>
              <ellipse cx="12" cy="68" rx="9" ry="6" fill="#d3ecff" />
            </g>
            <g className={`arm arm-r ${armsUp ? 'up' : ''} ${act === 'dance' ? 'dance' : ''} ${mood === 'hello' && !asleep && !armsUp ? 'wave' : ''}`}>
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
                <circle className="ring" cx="96" cy="76" r="15" fill="none" stroke="#4db8ff" strokeWidth="2" />
                <path d="M96 56 l15 5 v11 c0 10 -7 15 -15 19 c-8 -4 -15 -9 -15 -19 v-11z" fill="#4db8ff" stroke="#071426" strokeWidth="2" strokeLinejoin="round" />
                <path d="M89 73 l5 5 l10 -11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}

            {/* Cara */}
            <circle className="cheek" cx="36" cy="67" r="5" fill="#4db8ff" opacity=".4" />
            <circle className="cheek" cx="84" cy="67" r="5" fill="#4db8ff" opacity=".4" />

            <g ref={eyesRef} className="eyes">
              <g className={`eyes-in ${blink ? 'blink' : ''}`}>
                {closedEyes ? (
                  <g fill="none" stroke="#071426" strokeWidth="3" strokeLinecap="round">
                    <path d="M41 60 Q46 65 51 60" />
                    <path d="M69 60 Q74 65 79 60" />
                  </g>
                ) : dizzy ? (
                  <g fill="none" stroke="#071426" strokeWidth="1.8" strokeLinecap="round">
                    <g transform="translate(46 58)"><path className="spiral" d={SPIRAL} /></g>
                    <g transform="translate(74 58)"><path className="spiral" d={SPIRAL} /></g>
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
            </g>

            {mood === 'shield' && !closedEyes && !dizzy && (
              <g stroke="#071426" strokeWidth="2.6" strokeLinecap="round">
                <line x1="39" y1="46" x2="52" y2="49" />
                <line x1="81" y1="46" x2="68" y2="49" />
              </g>
            )}

            {mouth === 'smile' && <path d="M54 70 Q60 76 66 70" fill="none" stroke="#071426" strokeWidth="3" strokeLinecap="round" />}
            {mouth === 'open' && <path d="M52 69 Q60 83 68 69 Z" fill="#071426" strokeLinejoin="round" stroke="#071426" strokeWidth="2" />}
            {mouth === 'talk' && <ellipse className="mouth-talk" cx="60" cy="72" rx="5" ry="4.2" fill="#071426" />}
            {mouth === 'tilt' && <path d="M55 73 L66 70" fill="none" stroke="#071426" strokeWidth="3" strokeLinecap="round" />}
            {mouth === 'flat' && <path d="M55 72 L65 72" fill="none" stroke="#071426" strokeWidth="3" strokeLinecap="round" />}
            {mouth === 'wavy' && <path d="M53 72 Q56.5 68 60 72 T67 72" fill="none" stroke="#071426" strokeWidth="2.8" strokeLinecap="round" />}
            {mouth === 'sleep' && <ellipse cx="60" cy="72" rx="3" ry="3.6" fill="#071426" />}

            {/* Efectos por encima */}
            {mood === 'cheer' && (
              <g className="prop prop-stars" fill="#ffd166">
                <path className="twinkle t1" d="M8 14 l2.6 6 6.4 .6 -4.8 4.2 1.5 6.3 -5.7 -3.4 -5.7 3.4 1.5 -6.3 -4.8 -4.2 6.4 -.6z" />
                <path className="twinkle t2" d="M108 4 l2 4.6 5 .5 -3.7 3.3 1.1 4.9 -4.4 -2.6 -4.4 2.6 1.1 -4.9 -3.7 -3.3 5 -.5z" />
              </g>
            )}
            {mood === 'cheer' && (
              <g>
                {CONFETTI.map(([x, c], i) => (
                  <rect key={x} className="confetti" x={x} y="-8" width="4.5" height="7" rx="1" fill={c} style={{ animationDelay: `${i * 0.28}s` }} />
                ))}
              </g>
            )}
            {mood === 'ai' && (
              <g className="bits" fill="#4db8ff" fontFamily="ui-monospace, monospace" fontWeight="700" fontSize="11">
                <text className="bit" x="30" y="14">1</text>
                <text className="bit b2" x="84" y="10">0</text>
                <text className="bit b3" x="98" y="22">1</text>
              </g>
            )}

            {act === 'rain' && (
              <g fill="#4db8ff">
                {[30, 42, 54, 66, 78, 90].map((x, i) => (
                  <ellipse key={x} className="drop" cx={x} cy="86" rx="1.8" ry="3.2" style={{ animationDelay: `${(i % 3) * 0.22 + i * 0.05}s` }} />
                ))}
              </g>
            )}
            {act === 'dance' && (
              <g fill="#4db8ff" fontFamily="system-ui, sans-serif" fontWeight="700">
                <text className="note" x="4" y="30" fontSize="16">♪</text>
                <text className="note n2" x="100" y="26" fontSize="18">♫</text>
                <text className="note n3" x="56" y="6" fontSize="14">♪</text>
              </g>
            )}
            {act === 'sneeze' && (
              <g fill="#cfeaff">
                <circle className="sd" cx="68" cy="73" r="2" style={cssVars({ '--dx': '30px', '--dy': '6px' })} />
                <circle className="sd" cx="68" cy="73" r="1.6" style={cssVars({ '--dx': '38px', '--dy': '-4px' })} />
                <circle className="sd" cx="68" cy="73" r="1.4" style={cssVars({ '--dx': '26px', '--dy': '16px' })} />
                <text className="prop" x="86" y="62" fontSize="10" fontWeight="800" fill="#f2f6fa" fontFamily="system-ui, sans-serif">¡achú!</text>
              </g>
            )}
            {joy && !dizzy && (
              <g fill="#ff7a90" fontSize="12">
                <text className="heart" x="36" y="22">♥</text>
                <text className="heart h2" x="58" y="12">♥</text>
                <text className="heart h3" x="80" y="22">♥</text>
              </g>
            )}
            {dizzy && (
              <g className="orbit" fill="#ffd166" fontSize="11" textAnchor="middle">
                <text x="40" y="14">★</text>
                <text x="62" y="4">★</text>
                <text x="84" y="14">★</text>
              </g>
            )}
            {wake && (
              <text className="prop" x="56" y="8" fontSize="24" fontWeight="800" fill="#ffd166" fontFamily="system-ui, sans-serif">!</text>
            )}
            {puff && (
              <g fill="#ffffff">
                {PUFFS.map(([dx, dy], i) => (
                  <circle key={i} className="puff" cx="60" cy="80" r={5 - (i % 2)} style={cssVars({ '--dx': `${dx}px`, '--dy': `${dy}px` })} />
                ))}
              </g>
            )}
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
