"use client";

import { useEffect, useRef, useState } from "react";
import WaitlistModal from "@/components/WaitlistModal";

export default function Home() {
  const [year, setYear] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.16 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="grain" aria-hidden="true"></div>
        <nav className="nav" aria-label="Main navigation">
          <a href="#top" className="brand" aria-label="TOVIO home">
            TOVIO
          </a>
          <span className="status">
            <i aria-hidden="true"></i>Coming soon
          </span>
        </nav>
        <div className="hero-content" id="top">
          <p className="eyebrow">Kerala / Construction / Reimagined</p>
          <h1 id="hero-title">Something New Is Taking Shape.</h1>
          <p className="intro">
            A smarter digital experience is coming to Kerala&apos;s construction world.
          </p>
          <p className="tagline">Built for what&rsquo;s next. Built for Kerala.</p>
          <button 
            className="waitlist" 
            onClick={() => setIsModalOpen(true)}
            aria-label="Open waitlist form"
          >
            <span aria-hidden="true">→</span>JOIN THE WAITLIST
          </button>
        </div>
        <div className="hero-footer">
          <p className="coming">Coming Soon.</p>
          <a className="scroll" href="#about">
            Discover
          </a>
        </div>
      </section>

      <section className="curiosity" id="about" aria-labelledby="about-title">
        <div className="curiosity-inner reveal" ref={revealRef}>
          <p className="section-label">01 / An introduction</p>
          <h2 id="about-title">What Is TOVIO?</h2>
          <p className="question">
            We could tell you. <br />
            <em>But where&rsquo;s the fun in that?</em>
          </p>
          <p className="detail">
            For now, all you need to know is that we&rsquo;re building something for the
            people who build, create and shape Kerala.
          </p>
          <p className="arriving">TOVIO is coming.</p>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <h3>Made for the people shaping tomorrow.</h3>
            <p className="malayalam" lang="ml">
              കേരളത്തിനായി. പുതിയൊരു തുടക്കം.
              <span className="translation">For Kerala. A new beginning.</span>
            </p>
          </div>
          <div className="footer-bottom">
            <span className="brand">TOVIO</span>
            <span>© {year} TOVIO. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <WaitlistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </main>
  );
}
