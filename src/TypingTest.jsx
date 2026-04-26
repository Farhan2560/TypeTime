import { useState, useEffect, useRef, useCallback } from 'react';

const WORD_POOL = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
];

function generateWords() {
  const shuffled = [...WORD_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 30);
}

const TIMER_SECONDS = 30;

export default function TypingTest({ theme }) {
  const [words, setWords] = useState(() => generateWords());
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  // typedChars[wi][ci] = 'correct' | 'incorrect' | null
  const [typedChars, setTypedChars] = useState(() =>
    Array.from({ length: 30 }, () => [])
  );
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [status, setStatus] = useState('idle'); // idle | running | finished
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);

  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const restart = useCallback(() => {
    clearInterval(timerRef.current);
    setWords(generateWords());
    setWordIndex(0);
    setCharIndex(0);
    setTypedChars(Array.from({ length: 30 }, () => []));
    setTimeLeft(TIMER_SECONDS);
    setStatus('idle');
    setCorrectChars(0);
    setIncorrectChars(0);
  }, []);

  // Start countdown when status becomes 'running'
  useEffect(() => {
    if (status !== 'running') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setStatus('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [status]);

  // Global keydown handler
  useEffect(() => {
    const handleKey = (e) => {
      if (status === 'finished') return;

      const key = e.key;

      // Ignore modifier-key combos (Ctrl+C etc.)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (key === 'Tab') {
        e.preventDefault();
        restart();
        return;
      }

      if (status === 'idle' && key.length === 1) {
        setStatus('running');
      }
      if (status === 'finished') return;

      if (key === 'Backspace') {
        setCharIndex((ci) => {
          if (ci === 0) return 0;
          const newCi = ci - 1;
          setTypedChars((prev) => {
            const next = prev.map((w) => [...w]);
            const removed = next[wordIndex][newCi];
            next[wordIndex] = next[wordIndex].slice(0, newCi);
            if (removed === 'correct') setCorrectChars((c) => Math.max(0, c - 1));
            if (removed === 'incorrect') setIncorrectChars((c) => Math.max(0, c - 1));
            return next;
          });
          return newCi;
        });
        return;
      }

      if (key === ' ') {
        e.preventDefault();
        // Only advance if at least one char typed
        if (charIndex === 0) return;
        setWordIndex((wi) => {
          const nextWi = wi + 1;
          if (nextWi >= words.length) {
            clearInterval(timerRef.current);
            setStatus('finished');
          }
          return nextWi < words.length ? nextWi : wi;
        });
        setCharIndex(0);
        return;
      }

      if (key.length === 1) {
        const currentWord = words[wordIndex];
        // Don't allow typing past word length + a small buffer
        if (charIndex >= currentWord.length) return;
        const isCorrect = key === currentWord[charIndex];
        setTypedChars((prev) => {
          const next = prev.map((w) => [...w]);
          next[wordIndex] = [...next[wordIndex], isCorrect ? 'correct' : 'incorrect'];
          return next;
        });
        if (isCorrect) setCorrectChars((c) => c + 1);
        else setIncorrectChars((c) => c + 1);
        setCharIndex((ci) => ci + 1);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, wordIndex, charIndex, words, restart]);

  // Scroll current word into view
  useEffect(() => {
    if (containerRef.current) {
      const activeLine = containerRef.current.querySelector('[data-active-word]');
      if (activeLine) {
        activeLine.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [wordIndex]);

  const wpm = Math.round((correctChars / 5) / (TIMER_SECONDS / 60));
  const totalTyped = correctChars + incorrectChars;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

  if (status === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center gap-8">
        <h2 style={{ color: theme.textPrimary, fontFamily: 'ui-monospace, monospace', fontSize: '1.5rem' }}>
          Results
        </h2>
        <div className="flex gap-12">
          <div className="flex flex-col items-center gap-1">
            <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>wpm</span>
            <span style={{ color: theme.textPrimary, fontSize: '4rem', fontWeight: 700, lineHeight: 1 }}>
              {wpm}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>accuracy</span>
            <span style={{ color: theme.textPrimary, fontSize: '4rem', fontWeight: 700, lineHeight: 1 }}>
              {accuracy}%
            </span>
          </div>
        </div>
        <button
          onClick={restart}
          style={{
            background: 'transparent',
            border: `2px solid ${theme.caret}`,
            color: theme.caret,
            padding: '0.5rem 2rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '1rem',
            marginTop: '1rem',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.caret;
            e.currentTarget.style.color = theme.background;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = theme.caret;
          }}
        >
          restart
        </button>
        <p style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>or press Tab</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">
      {/* Timer */}
      <div style={{ color: theme.caret, fontSize: '1.8rem', fontWeight: 700, textAlign: 'left' }}>
        {timeLeft}
      </div>

      {/* Words area */}
      <div
        ref={containerRef}
        style={{ maxHeight: '9rem', overflow: 'hidden', position: 'relative' }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '1.5rem',
            lineHeight: '2.8rem',
            userSelect: 'none',
          }}
        >
          {words.map((word, wi) => (
            <span
              key={wi}
              data-active-word={wi === wordIndex ? true : undefined}
              style={{ position: 'relative', whiteSpace: 'nowrap' }}
            >
              {word.split('').map((char, ci) => {
                const state = typedChars[wi]?.[ci];
                let color = theme.textSecondary;
                if (state === 'correct') color = theme.textPrimary;
                if (state === 'incorrect') color = theme.textError;

                // Blinking caret: before current char in current word
                const showCaret = wi === wordIndex && ci === charIndex;

                return (
                  <span key={ci} style={{ position: 'relative' }}>
                    {showCaret && (
                      <span
                        className="caret-blink"
                        style={{
                          position: 'absolute',
                          left: '-2px',
                          top: '0',
                          bottom: '0',
                          width: '2px',
                          background: theme.caret,
                          borderRadius: '1px',
                        }}
                      />
                    )}
                    <span style={{ color }}>{char}</span>
                  </span>
                );
              })}
              {/* Caret at end of word (when all chars typed) */}
              {wi === wordIndex && charIndex === word.length && (
                <span
                  className="caret-blink"
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1.5rem',
                    background: theme.caret,
                    borderRadius: '1px',
                    verticalAlign: 'middle',
                  }}
                />
              )}
            </span>
          ))}
        </div>
      </div>

      <p style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
        {status === 'idle' ? 'start typing to begin…' : ''}
        {status === 'running' ? ' ' : ''}
      </p>
      <p style={{ color: theme.textSecondary, fontSize: '0.75rem' }}>press Tab to restart</p>
    </div>
  );
}
