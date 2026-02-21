'use client';

const AutoAegisLanding = () => {
  const darkBg = '#0a0e27';
  const darkCard = '#111630';
  const darkBorder = '#1e293b';
  const lightText = '#f0f1f5';
  const mutedText = '#94a3b8';
  const primary = '#3b82f6';
  const secondary = '#60a5fa';
  const accent = '#10b981';
  const destructive = '#ef4444';

  const styles = {
    container: {
      background: `linear-gradient(to bottom, ${darkBg}, ${darkBg}, ${darkCard})`,
      color: lightText,
    },
    nav: {
      borderBottom: `1px solid rgba(30, 41, 59, 0.4)`,
      backdropFilter: 'blur(12px)',
      backgroundColor: `rgba(10, 14, 39, 0.8)`,
    },
    navContent: {
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    navLinks: {
      display: 'flex',
      gap: '40px',
      alignItems: 'center',
    },
    navLink: {
      color: lightText,
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'color 0.3s',
    },
    button: {
      primary: {
        padding: '12px 32px',
        borderRadius: '9999px',
        backgroundColor: primary,
        color: 'white',
        border: 'none',
        fontWeight: '500',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
      },
      secondary: {
        padding: '12px 32px',
        borderRadius: '9999px',
        backgroundColor: darkCard,
        color: lightText,
        border: `1px solid ${darkBorder}`,
        fontWeight: '500',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
      },
    },
    section: {
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '80px 24px',
    },
    card: {
      border: `1px solid rgba(30, 41, 59, 0.5)`,
      backgroundColor: 'rgba(17, 22, 48, 0.5)',
      padding: '32px',
      borderRadius: '12px',
      backdropFilter: 'blur(12px)',
    },
  };

  return (
    <div style={{ ...styles.container, minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, ...styles.nav }}>
        <div style={styles.navContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: `linear-gradient(to bottom right, ${primary}, ${accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
            }}>
              A
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>AutoAegis</span>
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <a href="#features" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = primary} onMouseLeave={(e) => e.target.style.color = mutedText}>Features</a>
            <a href="#pricing" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = primary} onMouseLeave={(e) => e.target.style.color = mutedText}>Pricing</a>
            <a href="#docs" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = primary} onMouseLeave={(e) => e.target.style.color = mutedText}>Docs</a>
          </div>
          <button style={styles.button.primary}>Start your Aegis</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.section}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: '9999px',
            backgroundColor: darkCard,
            border: `1px solid ${darkBorder}`,
            marginBottom: '24px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: accent }}>🎯 Synthetic Monitoring</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 10vw, 56px)',
            fontWeight: 'bold',
            lineHeight: 1.2,
            marginBottom: '24px',
          }}>
            Stop Losing Revenue to
            <span style={{
              backgroundImage: `linear-gradient(to right, ${primary}, ${secondary}, ${accent})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginLeft: '8px',
            }}>
              Silent Failures
            </span>
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: mutedText,
            maxWidth: '800px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}>
            Most monitoring stays green while your checkout fails. We simulate real user journeys from 20+ global regions to catch broken flows before your customers do.
          </p>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              ...styles.button.primary,
              padding: '14px 32px',
              fontWeight: '600',
            }}>
              Start Protecting Your Journeys
            </button>
            <button style={{
              ...styles.button.secondary,
              padding: '14px 32px',
              fontWeight: '600',
            }}>
              Watch 2-Min Demo
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginTop: '64px',
        }}>
          <div style={{
            ...styles.card,
            border: `1px solid rgba(30, 41, 59, 0.5)`,
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: accent, marginBottom: '16px' }}>✓ Infrastructure Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[{ label: 'CPU: 10%' }, { label: 'Memory: 45%' }, { label: 'Response Time: 120ms' }].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(10, 14, 39, 0.5)',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: accent,
                  }}></div>
                  <span style={{ fontSize: '14px' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            ...styles.card,
            border: `1px solid rgba(239, 68, 68, 0.5)`,
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: destructive, marginBottom: '16px' }}>✗ Real User Impact</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[{ label: 'Checkout Failed' }, { label: 'Buy Button Unclickable' }, { label: 'Lost Conversions: $12K+' }].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(10, 14, 39, 0.5)',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: destructive,
                  }}></div>
                  <span style={{ fontSize: '14px' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Everyone Ignores */}
      <section style={styles.section}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 'bold', marginBottom: '16px' }}>
            The Problem Everyone Ignores
          </h2>
          <p style={{ fontSize: '18px', color: mutedText, maxWidth: '600px', margin: '0 auto' }}>
            Why traditional monitoring fails your users
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {[
            {
              title: 'The Blind Spot',
              desc: 'Your servers are at 10% CPU, but the "Buy Now" button is unclickable. Traditional monitoring never catches it.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" /><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                </svg>
              ),
              color: primary,
            },
            {
              title: 'Alert Fatigue',
              desc: 'Stop getting paged for network blips. Get alerted only when a user actually can\'t log in.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8m0 0v5a1 1 0 001 1h10a1 1 0 001-1V8m-12 8h12" /><line x1="9" y1="19" x2="9" y2="21" /><line x1="15" y1="19" x2="15" y2="21" />
                </svg>
              ),
              color: accent,
            },
            {
              title: 'Lost Context',
              desc: 'No more "it works on my machine." Get a video replay of every single failure in seconds.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 6v12a1 1 0 001 1h14a1 1 0 001-1V6M9 3h6a1 1 0 011 1v2H8V4a1 1 0 011-1z" /><circle cx="12" cy="13" r="2" />
                </svg>
              ),
              color: secondary,
            },
          ].map((problem, idx) => (
            <div key={idx} style={{
              ...styles.card,
              transition: 'border-color 0.3s',
              borderColor: `rgba(30, 41, 59, 0.5)`,
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: `${problem.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: problem.color,
              }}>
                {problem.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{problem.title}</h3>
              <p style={{ color: mutedText, lineHeight: 1.6 }}>{problem.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={styles.section}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 'bold', marginBottom: '16px' }}>
            The AutoAegis Advantage
          </h2>
          <p style={{ fontSize: '18px', color: mutedText, maxWidth: '600px', margin: '0 auto' }}>
            Three steps to bulletproof user journeys
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
        }}>
          {[
            { num: '1', title: 'Capture', desc: 'Drop our 1KB script into your app. We record how real users navigate your "Golden Paths."' },
            { num: '2', title: 'Synthesize', desc: 'Our AI cleans the noise and generates resilient Playwright scripts automatically.' },
            { num: '3', title: 'Monitor', desc: 'Run tests 24/7 globally. If a step slows or breaks, get the video and the fix instantly.' },
          ].map((step, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundImage: `linear-gradient(to bottom right, ${primary}, ${accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                marginBottom: '16px',
                fontSize: '18px',
              }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{step.title}</h3>
              <p style={{ color: mutedText, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section style={styles.section}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 'bold', marginBottom: '16px' }}>
            Powerful Features
          </h2>
          <p style={{ fontSize: '18px', color: mutedText, maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to prevent failures
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {[
            { title: 'Global Probes', desc: 'Test from Tokyo, London, New York, and São Paulo to detect regional ISP or CDN issues.' },
            { title: 'Deep Diagnostic Evidence', desc: 'Every failure includes a Video Replay, Full Network Trace (HAR), and Browser Console Logs.' },
            { title: 'Step-Level Latency', desc: 'Don\'t just track "Uptime." Track p95 speeds for every click in your checkout funnel.' },
            { title: 'Zero-Maintenance AI', desc: 'When your UI changes, our AI suggests script updates so your tests don\'t break.' },
          ].map((feature, idx) => (
            <div key={idx} style={styles.card}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: accent }}>{feature.title}</h3>
              <p style={{ color: mutedText, lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section style={styles.section}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 'bold', marginBottom: '8px' }}>Integrations</h2>
          <p style={{ fontSize: '18px', color: mutedText }}>Seamlessly connects to your tech stack</p>
        </div>
        <div style={{
          ...styles.card,
          padding: '48px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px',
          }}>
            {['Slack', 'PagerDuty', 'GitHub', 'Vercel', 'Datadog'].map((int) => (
              <div key={int} style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(10, 14, 39, 0.5)',
                border: `1px solid ${darkBorder}`,
                fontSize: '14px',
                fontWeight: '600',
                color: mutedText,
              }}>
                {int}
              </div>
            ))}
          </div>
        </div>
        <div style={{
          marginTop: '32px',
          padding: '24px',
          borderRadius: '8px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: `1px solid rgba(16, 185, 129, 0.3)`,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', color: mutedText, marginBottom: '8px' }}>🔒 Security First</p>
          <p style={{ fontWeight: '600' }}>SOC2 Compliant. We automatically mask PII and sensitive user data in every recording.</p>
        </div>
      </section>

      {/* Social Proof / CTA */}
      <section style={styles.section}>
        <div style={{
          ...styles.card,
          borderRadius: '16px',
          border: `1px solid rgba(16, 185, 129, 0.3)`,
          background: `linear-gradient(to right, rgba(17, 22, 48, 0.5), rgba(17, 22, 48, 0.3), rgba(17, 22, 48, 0.5))`,
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 'bold', marginBottom: '16px' }}>
            See It in Action
          </h2>
          <p style={{
            fontSize: '18px',
            color: mutedText,
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}>
            We've built a "Broken E-commerce" sandbox. Break the site and watch AutoAegis detect the failure in real-time.
          </p>
          <button style={{
            padding: '14px 32px',
            borderRadius: '9999px',
            backgroundImage: `linear-gradient(to right, ${primary}, ${accent})`,
            color: 'white',
            border: 'none',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'opacity 0.3s',
          }}>
            Try Interactive Demo
          </button>
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.section}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: 'bold', marginBottom: '24px', lineHeight: 1.2 }}>
            Ready to See Through Your Users' Eyes?
          </h2>
          <p style={{
            fontSize: '20px',
            color: mutedText,
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}>
            Join 500+ engineering teams moving from reactive to preventive monitoring.
          </p>
          <button style={{
            padding: '16px 40px',
            borderRadius: '9999px',
            backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})`,
            color: 'white',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'opacity 0.3s',
          }}>
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid rgba(30, 41, 59, 0.4)`,
        backgroundColor: 'rgba(10, 14, 39, 0.5)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '48px 24px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            marginBottom: '32px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: `linear-gradient(to bottom right, ${primary}, ${accent})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '12px',
                }}>
                  A
                </div>
                <span style={{ fontWeight: 'bold' }}>AutoAegis</span>
              </div>
              <p style={{ fontSize: '14px', color: mutedText }}>Synthetic monitoring for the modern web.</p>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="#" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s' }}>Features</a></li>
                <li><a href="#" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s' }}>Pricing</a></li>
                <li><a href="#" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s' }}>Security</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Resources</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="#" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s' }}>Docs</a></li>
                <li><a href="#" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s' }}>Blog</a></li>
                <li><a href="#" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s' }}>API</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="#" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s' }}>About</a></li>
                <li><a href="#" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s' }}>Contact</a></li>
                <li><a href="#" style={{ fontSize: '14px', color: mutedText, textDecoration: 'none', transition: 'color 0.3s' }}>Status</a></li>
              </ul>
            </div>
          </div>
          <div style={{
            borderTop: `1px solid ${darkBorder}`,
            paddingTop: '32px',
            textAlign: 'center',
            fontSize: '14px',
            color: mutedText,
          }}>
            <p>&copy; 2024 AutoAegis. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AutoAegisLanding;
