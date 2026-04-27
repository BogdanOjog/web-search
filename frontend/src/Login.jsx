import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('username'); // 'username' | 'password'
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const BASE = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/movies', '') 
    : 'http://localhost:3000/api';

  // Step 1: verifică dacă username-ul există
  async function handleCheckUsername(e) {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE}/users/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });
      const data = await res.json();
      setIsNewUser(!data.exists);
      setStep('password');
    } catch {
      setError('Eroare de conexiune cu serverul.');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: login sau register
  async function handleAuth(e) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Eroare la autentificare.');
        return;
      }

      localStorage.setItem('movieUser', JSON.stringify(data));
      onLogin(data);
      navigate('/movies');
    } catch {
      setError('Eroare de conexiune cu serverul.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <section className="add-section" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>

        {step === 'username' ? (
          <>
            <h2>Bine ai venit</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Introdu un nume de utilizator pentru a continua.
            </p>
            <form onSubmit={handleCheckUsername}>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Ex: Bogdan"
                required
                style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}
              />
              {error && <div className="alert">{error}</div>}
              <button type="submit" className={`btn-add ${loading ? 'loading' : ''}`} disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Se verifică...' : 'Continuă'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>{isNewUser ? '👋 Cont nou' : '👤 Bine ai revenit'}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {isNewUser
                ? `Creează o parolă pentru contul „${username}".`
                : `Introdu parola pentru „${username}".`}
            </p>
            <form onSubmit={handleAuth}>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder={isNewUser ? 'Alege o parolă' : 'Parola ta'}
                required
                autoFocus
                style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}
              />
              {error && <div className="alert">{error}</div>}
              <button type="submit" className={`btn-add ${loading ? 'loading' : ''}`} disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Se procesează...' : isNewUser ? 'Creează cont' : 'Intră în cont'}
              </button>
              <button 
                type="button" 
                onClick={() => { setStep('username'); setPassword(''); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.75rem', fontSize: '0.85rem' }}
              >
                ← Schimbă utilizatorul
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}