import React from 'react';

export function TypingIndicator() {
  return (
    <div aria-label="Assistant typing" className="bubble assistant surface">
      <span className="dot"/> <span className="dot"/> <span className="dot"/>
      <style>{`
        .dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.5;margin-right:4px;animation:blink 1s infinite}
        .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
        @keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:.8}}
      `}</style>
    </div>
  );
}
