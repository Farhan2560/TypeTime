import { useState } from 'react';
import TypingTest from './TypingTest';

const THEMES = {
  dark: {
    name: 'Dark',
    background: '#1a1a2e',
    textPrimary: '#e0e0e0',
    textSecondary: '#4a4a6a',
    textError: '#e05c5c',
    caret: '#e2b714',
  },
  light: {
    name: 'Light',
    background: '#f5f5f0',
    textPrimary: '#2c2c2c',
    textSecondary: '#aaaaaa',
    textError: '#c0392b',
    caret: '#e2b714',
  },
  cyberpunk: {
    name: 'Cyberpunk',
    background: '#0d0d0d',
    textPrimary: '#00ffff',
    textSecondary: '#1a3a3a',
    textError: '#ff0066',
    caret: '#ff00ff',
  },
  matrix: {
    name: 'Matrix',
    background: '#0a0a0a',
    textPrimary: '#00ff41',
    textSecondary: '#1a3a1a',
    textError: '#ff3333',
    caret: '#00ff41',
  },
};

export default function App() {
  const [activeTheme, setActiveTheme] = useState('dark');
  const theme = THEMES[activeTheme];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        transition: 'background 0.3s',
        fontFamily: 'ui-monospace, Consolas, monospace',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          background: theme.background,
          borderBottom: `1px solid ${theme.textSecondary}22`,
          zIndex: 10,
          transition: 'background 0.3s',
        }}
      >
        <span style={{ color: theme.caret, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.1em' }}>
          TypeTime
        </span>

        {/* Theme switcher */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setActiveTheme(key)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                border: `1px solid ${activeTheme === key ? t.caret : theme.textSecondary}`,
                background: activeTheme === key ? `${t.caret}22` : 'transparent',
                color: activeTheme === key ? t.caret : theme.textSecondary,
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontFamily: 'ui-monospace, monospace',
                transition: 'all 0.2s',
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          width: '100%',
          maxWidth: '750px',
          marginTop: '4rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <TypingTest key={activeTheme} theme={theme} />
      </main>
    </div>
  );
}
