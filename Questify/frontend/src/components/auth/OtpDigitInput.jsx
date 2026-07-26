import React, { useRef } from 'react';

/**
 * Six separate single-digit boxes that behave like one OTP field: typing advances focus,
 * backspace on an empty box steps back, and pasting a full code fills every box at once.
 */
export default function OtpDigitInput({ length = 6, value, onChange, disabled, autoFocus }) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const setDigitAt = (index, digit) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(''));
  };

  const handleChange = (index, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setDigitAt(index, digit);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted.padEnd(length, '').slice(0, length).trimEnd());
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="otp-digit-row" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className="otp-digit-box"
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
