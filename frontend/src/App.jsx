import { useState, useEffect, useRef } from 'react';
import MovieCard from './MovieCard';
import MovieModal from './MovieModal';
import './index.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/movies';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { fetchMovies(); }, []);

  async function fetchMovies() {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setMovies(data);
    } catch {
      console.error('Eroare la încărcarea filmelor');
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    const title = inputVal.trim();
    if (!title) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      setMovies(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      console.error('Eroare la ștergere');
    }
  }

  return (
    <>
      <header className="header">
        <h1>Colecția mea de <span>filme</span></h1>
        <p>jurnal personal de vizionări</p>
      </header>

      <main className="container">
        {/* Add form */}
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
              <button
                type="submit"
                className={`btn-add${loading ? ' loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Se caută' : 'Salvează'}
              </button>
            </div>
            {error && <div className="alert">{error}</div>}
          </form>
        </section>

        {/* Movies list */}
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
                  key={movie.id}
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
