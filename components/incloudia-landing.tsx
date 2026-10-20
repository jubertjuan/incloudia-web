'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ArrowRight,
  BookOpen,
  Cloud,
  HardDrive,
  Key,
  Bot,
  Shield,
  Zap,
  Check,
  ChevronDown,
  Mail,
  Menu,
  MessageCircle,
  Send,
  X,
} from 'lucide-react'

// Reemplazá con tu URL real de Formspree
const FORMSPREE_URL = 'https://formspree.io/f/TU_CODIGO_AQUI'

const faqs = [
  ['¿Necesito instalar algo?', 'No. Accedés a tu espacio de trabajo desde cualquier navegador, sin instalaciones locales.'],
  ['¿Dónde se aloja mi información?', 'En infraestructura redundante de nivel enterprise, con cifrado y respaldos.'],
  ['¿Puedo probar antes de contratar?', 'Sí. Coordinamos una demo o asesoramiento sin cargo según tu caso.'],
  ['¿Trabajan con empresas de cualquier tamaño?', 'Sí. Las soluciones se adaptan desde equipos chicos hasta operaciones más grandes.'],
]

const navItems = [
  { id: 'soluciones', label: 'Soluciones' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'valor', label: 'Por qué IncloudIA' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contacto', label: 'Contacto' },
]

function Logo() {
  return (
    <a href="#inicio" className="brand" aria-label="IncloudIA">
      <img src="/logo-incloudia.png" alt="IncloudIA Consultora" className="brand-logo" />
    </a>
  )
}

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true)
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)

    const safety = setTimeout(() => setIsInView(true), 1800)

    return () => {
      observer.disconnect()
      clearTimeout(safety)
    }
  }, [])

  return { ref, isInView }
}

export default function IncloudIALanding() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  const solRef = useInView()
  const clientsRef = useInView()
  const servicesRef = useInView()
  const valueRef = useInView()
  const faqRef = useInView()
  const contactRef = useInView()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const sections = navItems.map((item) => document.getElementById(item.id))
      const scrollPos = window.scrollY + 120
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(navItems[i].id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    setError(false)

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })

      if (res.ok) {
        setSent(true)
        form.reset()
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="site-shell">
      <div className="circuit-bg circuit-tl" aria-hidden="true" />
      <div className="circuit-bg circuit-br" aria-hidden="true" />

      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Logo />
          <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={activeSection === item.id ? 'active' : ''}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button className="header-cta" onClick={() => scrollTo('contacto')}>
            Hablemos <ArrowRight size={16} />
          </button>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">Consultora en Innovación y Tecnología</div>
              <h1>Transformación Digital e Infraestructura Cloud para tu Empresa.</h1>
              <p className="hero-lead">
                Soluciones tecnológicas a medida, seguras y escalables. Optimizamos tus costos operativos y potenciamos la productividad de tu equipo sin depender de hardware físico.
              </p>
              <div className="hero-actions">
                <button className="button button-primary" onClick={() => scrollTo('soluciones')}>
                  Conocé nuestras soluciones
                </button>
                <button className="button button-ghost" onClick={() => scrollTo('contacto')}>
                  Asesoramiento sin cargo
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="dashboard-card">
                <div className="dash-top">
                  <span className="dash-logo">INCLOUD iA</span>
                  <span className="live"><i /> Operativo</span>
                </div>
                <div className="dash-body">
                  <div className="dash-heading">
                    <div>
                      <small>ESPACIO DE TRABAJO</small>
                      <h3>Operación centralizada</h3>
                    </div>
                  </div>
                  <div className="dash-stats">
                    <span><Cloud size={16} /> Escritorios cloud activos</span>
                    <span><Shield size={16} /> Accesos controlados</span>
                    <span><Key size={16} /> Token virtualizado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="soluciones" className="section" ref={solRef.ref}>
          <div className={`container reveal ${solRef.isInView ? 'in-view' : ''}`}>
            <div className="section-heading">
              <span className="section-index">Soluciones principales</span>
              <h2>Resolvemos problemas concretos de tu operación.</h2>
            </div>
            <div className="solution-list">
              <article className="solution-block">
                <div className="solution-icon"><BookOpen /></div>
                <div>
                  <h3>Aulas y Entornos Virtuales</h3>
                  <p className="problem"><strong>Problema:</strong> Altos costos logísticos, límites de espacio físico y barreras tecnológicas en la capacitación.</p>
                  <p><strong>Solución:</strong> Plataformas e-learning de acceso web (24/7) sin instalaciones. Entornos seguros con repositorios centralizados para docentes y carpetas individuales para alumnos.</p>
                  <p className="benefit"><strong>Beneficio:</strong> Escalabilidad de matrícula sin invertir en metros cuadrados. Modelo híbrido y eliminación de gastos de traslados y alquileres.</p>
                </div>
              </article>
              <article className="solution-block">
                <div className="solution-icon"><Cloud /></div>
                <div>
                  <h3>Escritorios Cloud y Almacenamiento Corporativo</h3>
                  <p className="problem"><strong>Problema:</strong> Dependencia de hardware costoso, lentitud de AnyDesk/TeamViewer y riesgo de pérdida de datos locales.</p>
                  <p><strong>Solución:</strong> Espacios de trabajo virtualizados y almacenamiento encriptado accesibles desde el navegador.</p>
                  <p className="benefit"><strong>Beneficio:</strong> Mejor rendimiento sin sobrecargar las PCs locales. Mayor seguridad y reducción del gasto en renovación de equipamiento.</p>
                </div>
              </article>
              <article className="solution-block">
                <div className="solution-icon"><Key /></div>
                <div>
                  <h3>Token Virtualizado para Comercio Exterior</h3>
                  <p className="problem"><strong>Problema:</strong> Riesgo de pérdida, robo o daño de tokens físicos y demoras en despachos aduaneros.</p>
                  <p><strong>Solución:</strong> Sistema IoT que mantiene el token físico resguardado en la oficina. Los operadores acceden mediante túnel VPN encriptado desde cualquier lugar.</p>
                  <p className="benefit"><strong>Beneficio:</strong> Riesgo cero sobre el hardware crítico. Operaciones ágiles y cumplimiento normativo de aduana.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="clientes" className="section section-dark" ref={clientsRef.ref}>
          <div className={`container reveal ${clientsRef.isInView ? 'in-view' : ''}`}>
            <div className="section-heading">
              <span className="section-index">Clientes</span>
              <h2>Casos reales.</h2>
            </div>
            <div className="clients-grid">
              <article className="client-card">
                <div className="client-logo">
                  <img src="/cacipra.png" alt="CACIPRA" />
                </div>
                <h3>CACIPRA</h3>
                <p>Infraestructura virtual con 20 equipos para cursos, con acceso vía web para alumnos y por consola para el docente. Discos en la nube.</p>
                <p>Servidores web y databases de funcionamiento crítico. Datacenter con servicio 24x7, redundancia y backups constantes.</p>
              </article>
              <article className="client-card">
                <div className="client-logo">
                  <img src="/hb-comex.png" alt="HB Comex" />
                </div>
                <h3>HB Comex</h3>
                <p>Manejo de infraestructura física de red on site, con gateway Mikrotik, balanceo de líneas y soporte remoto. Mantenimiento de equipos informáticos.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="servicios" className="section" ref={servicesRef.ref}>
          <div className={`container reveal ${servicesRef.isInView ? 'in-view' : ''}`}>
            <div className="section-heading">
              <span className="section-index">Servicios especializados</span>
              <h2>Enfoque integral en tecnología.</h2>
            </div>
            <div className="services-grid">
              <article className="service-card">
                <Bot />
                <h3>Soluciones en Inteligencia Artificial</h3>
                <p>Integración de herramientas de IA en los flujos de trabajo para automatizar tareas repetitivas, optimizar tiempos y mejorar la toma de decisiones.</p>
              </article>
              <article className="service-card">
                <HardDrive />
                <h3>Administración IT, Redes y Soporte</h3>
                <p>Gestión de servidores, Active Directory, VPN, ciberseguridad y mantenimiento preventivo para garantizar la continuidad del negocio.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="valor" className="section section-dark" ref={valueRef.ref}>
          <div className={`container reveal ${valueRef.isInView ? 'in-view' : ''}`}>
            <div className="section-heading centered">
              <span className="section-index">Por qué INCLOUD</span>
              <h2>Lo que nos diferencia.</h2>
            </div>
            <div className="value-grid">
              <div className="value-item">
                <Zap />
                <h3>Reducción de Costos</h3>
                <p>Menos inversión en hardware local y licencias innecesarias.</p>
              </div>
              <div className="value-item">
                <Shield />
                <h3>Seguridad y Privacidad</h3>
                <p>Túneles VPN, conexiones encriptadas y respaldos continuos.</p>
              </div>
              <div className="value-item">
                <Cloud />
                <h3>Flexibilidad y Escalabilidad</h3>
                <p>Infraestructura que crece al ritmo de las necesidades de tu empresa.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="section" ref={faqRef.ref}>
          <div className={`container reveal ${faqRef.isInView ? 'in-view' : ''}`}>
            <div className="section-heading">
              <span className="section-index">Preguntas frecuentes</span>
              <h2>Lo esencial, sin vueltas.</h2>
            </div>
            <div className="accordion">
              {faqs.map(([question, answer], i) => (
                <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={question}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    <span>{question}</span>
                    <ChevronDown />
                  </button>
                  {openFaq === i && <p>{answer}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="section section-dark" ref={contactRef.ref}>
          <div className={`container contact-grid reveal ${contactRef.isInView ? 'in-view' : ''}`}>
            <div>
              <div className="section-heading">
                <span className="section-index">Contacto</span>
                <h2>Contanos qué necesitás.</h2>
                <p>Respondemos en menos de 24 horas hábiles. También podés escribirnos por WhatsApp.</p>
              </div>
              <div className="contact-details">
                <a href="https://wa.me/5491164157261"><MessageCircle /> +54 9 11 6415-7261</a>
                <a href="mailto:consultora@incloudia.ar"><Mail /> consultora@incloudia.ar</a>
                <span>Atención presencial e implementaciones remotas</span>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              {sent ? (
                <div className="success-state">
                  <Check />
                  <h3>Consulta enviada</h3>
                  <p>Te vamos a contactar a la brevedad.</p>
                  <button type="button" className="button button-ghost" onClick={() => setSent(false)}>
                    Enviar otra
                  </button>
                </div>
              ) : (
                <>
                  <div className="form-row">
                    <label>
                      Nombre
                      <input name="nombre" required placeholder="Tu nombre" />
                    </label>
                    <label>
                      Email
                      <input name="email" type="email" required placeholder="tu@empresa.com" />
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      Empresa
                      <input name="empresa" placeholder="Nombre de la empresa" />
                    </label>
                    <label>
                      Asunto
                      <input name="asunto" placeholder="Motivo de la consulta" />
                    </label>
                  </div>
                  <label>
                    Mensaje
                    <textarea name="mensaje" required rows={4} placeholder="Contanos qué necesitás..." />
                  </label>

                  <input type="hidden" name="_subject" value="Nueva consulta desde IncloudIA" />

                  {error && (
                    <p className="form-error">
                      Hubo un error al enviar. Intentá de nuevo o escribinos por WhatsApp.
                    </p>
                  )}

                  <button className="button button-primary" type="submit" disabled={sending}>
                    {sending ? 'Enviando...' : (
                      <>
                        Enviar consulta <Send size={16} />
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </section>
      </main>

      <a
        href="https://wa.me/5491164157261"
        className="whatsapp-float"
        aria-label="WhatsApp"
        title="Escribinos por WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle />
      </a>

      <footer>
        <div className="container footer-inner">
          <div>
            <Logo />
            <p>Infraestructura cloud y soluciones tecnológicas a medida.</p>
          </div>
          <div>
            <span>Buenos Aires, Argentina</span><br />
            <a href="mailto:consultora@incloudia.ar">consultora@incloudia.ar</a>
          </div>
          <small>© 2026 IncloudIA</small>
        </div>
      </footer>
    </div>
  )
}