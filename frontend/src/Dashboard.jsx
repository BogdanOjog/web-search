import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard';
import MovieModal from './MovieModal';

export default function Dashboard({ user, onLogout }) {
  const [movies, setMovies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/movies';

  // Stabilizăm funcția cu useCallback pentru a putea fi pusă în useEffect
  const fetchMovies = useCallback(async () => {
    try {
      const res = await fetch(API, {
        headers: { 'user-id': user._id }
      });
      const data = await res.json();
      setMovies(data);
    } catch {
      console.error('Eroare la încărcarea filmelor');
    }
  }, [API, user._id]); // Dependințele funcției

  useEffect(() => { 
    if (!user) {
      navigate('/');
    } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMovies(); 
    }
  }, [user, navigate, fetchMovies]); // fetchMovies este acum o dependență validă

  async function handleAdd(e) {
    e.preventDefault();
    const title = inputVal.trim();
    if (!title) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'user-id': user._id
        },
        body: JSON.stringify({ title }),
      });

      if (res.status === 409) {
        setError('Ai adăugat deja acest film în colecție!');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError('Nu am găsit filmul. Verifică titlul și încearcă din nou.');
        setLoading(false);
        return;
      }

      setInputVal('');
      await fetchMovies();
    } catch {
      setError('Eroare de conexiune cu serverul.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await fetch(`${API}/${id}`, { 
        method: 'DELETE',
        headers: { 'user-id': user._id }
      });
      setMovies(prev => prev.filter(m => m._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch {
      console.error('Eroare la ștergere');
    }
  }

  function handleLogout() {
    localStorage.removeItem('movieUser');
    onLogout();
    navigate('/');
  }

  if (!user) return null;

  return (
    <>
      <header className="header" style={{ position: 'relative' }}>
        <button onClick={handleLogout} className="btn-delete" style={{ position: 'absolute', top: '1rem', right: '1rem', width: 'auto', border: 'none', borderRadius: '8px' }}>Deconectare</button>
        <h1>Colecția lui <span>{user.username}</span></h1>
        <p>jurnal personal de vizionări</p>
      </header>

      <main className="container">
        <section className="add-section">
          <h2>Adaugă un film nou</h2>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={e => { setInputVal(e.target.value); setError(''); }}
                placeholder="ex. Interstellar, The Godfather..."
                disabled={loading}
                required
              />
              <button type="submit" className={`btn-add${loading ? ' loading' : ''}`} disabled={loading}>
                {loading ? 'Se caută' : 'Salvează'}
              </button>
            </div>
            {error && <div className="alert">{error}</div>}
          </form>
        </section>

        <section>
          <div className="section-head">
            <h2>Filme salvate</h2>
            {movies.length > 0 && (
              <span className="count-badge">{movies.length} {movies.length === 1 ? 'film' : 'filme'}</span>
            )}
          </div>

          <div className="movies-grid">
            {movies.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🎬</div>
                <h3>Colecția e goală</h3>
                <p>Adaugă primul tău film de mai sus</p>
              </div>
            ) : (
              movies.map(movie => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  onOpen={setSelected}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {selected && (
        <MovieModal movie={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}