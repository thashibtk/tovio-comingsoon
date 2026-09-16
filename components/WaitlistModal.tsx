"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("waitlist")
        .insert([{ email }]);

      if (error) {
        // 23505 is the PostgreSQL error code for unique_violation
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          throw new Error("You are already on the waitlist!");
        }
        throw new Error(error.message || "Failed to join waitlist");
      }

      setStatus("success");
      setEmail("");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        
        <h2 className="modal-title">Join the waitlist</h2>
        <p className="modal-description">
          Be the first to know when we launch TOVIO.
        </p>

        {status === "success" ? (
          <div className="modal-success">
            <span aria-hidden="true">✓</span>
            <p>You&apos;re on the list! We&apos;ll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                disabled={status === "loading"}
              />
            </div>
            {status === "error" && (
              <p className="modal-error">{errorMessage}</p>
            )}
            <button 
              type="submit" 
              className="form-button"
              disabled={status === "loading"}
            >
              {status === "loading" ? "JOINING..." : "JOIN NOW"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
