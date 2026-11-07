"use client";

import { useEffect, useRef, useState } from "react";

const LENGTH = 6;

function slotsFrom(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, LENGTH);
  return Array.from({ length: LENGTH }, (_, index) => digits[index] ?? "");
}

export default function OtpInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [slots, setSlots] = useState(() => slotsFrom(value));

  useEffect(() => {
    if (value.replace(/\D/g, "") !== slots.join("")) setSlots(slotsFrom(value));
  }, [slots, value]);

  function commit(next: string[], focusIndex: number) {
    setSlots(next);
    onChange(next.join("").replace(/\D/g, ""));
    refs.current[Math.max(0, Math.min(focusIndex, LENGTH - 1))]?.focus();
  }

  function write(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      const next = slots.slice();
      next[index] = "";
      commit(next, index);
      return;
    }
    const next = slots.slice();
    const chars = digits.slice(0, LENGTH - index).split("");
    chars.forEach((char, offset) => {
      next[index + offset] = char;
    });
    commit(next, index + chars.length);
  }

  return (
    <div className="otp-boxes">
      {slots.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          className="form-input"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`${label} ${index + 1}`}
          maxLength={LENGTH}
          value={digit}
          onChange={(event) => write(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !slots[index] && index > 0) {
              event.preventDefault();
              const next = slots.slice();
              next[index - 1] = "";
              commit(next, index - 1);
            }
            if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
            if (event.key === "ArrowRight" && index < LENGTH - 1) refs.current[index + 1]?.focus();
          }}
          onPaste={(event) => {
            event.preventDefault();
            write(index, event.clipboardData.getData("text"));
          }}
        />
      ))}
    </div>
  );
}
