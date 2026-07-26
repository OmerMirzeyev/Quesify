import React, { useEffect, useState } from 'react';

/** Live mm:ss countdown to `expiresAt` (a Date.now()-style timestamp). Calls onExpire() once. */
export default function OtpCountdown({ expiresAt, onExpire }) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    setRemainingMs(Math.max(0, expiresAt - Date.now()));
    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        const next = Math.max(0, expiresAt - Date.now());
        if (prev > 0 && next === 0) onExpire?.();
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <span className={`otp-countdown ${remainingMs === 0 ? 'expired' : ''}`}>
      {minutes}:{String(seconds).padStart(2, '0')}
    </span>
  );
}
