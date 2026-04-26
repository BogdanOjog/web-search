import { useEffect } from 'react';

export default function MovieModal({ movie, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!movie) return null;

  const ratingNum = parseFloat(movie.rating);
  const pct = !isNaN(ratingNum) ? ratingNum * 10 : null;
  const showWatch = pct !== null && pct > 80;
  const showAvoid = pct !== null && pct < 50;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose} aria-label="Închide">✕</button>

        <div className="modal-body">
          <div className="modal-poster-wrap">
            <img
              src={movie.poster}
              alt={`Poster ${movie.title}`}
              className="modal-poster"
              onError={(e) => { e.target.src = 'https://placehold.co/220x330/13131a/c9a84c?text=N%2FA'; }}
            />
          </div>

          <div className="modal-info">
            <h2 className="modal-title">{movie.title}</h2>

            {showWatch && (
              <div className="rec-banner rec-watch">
                ✦ Vizionează chiar acum! — scor publicului {pct}%
              </div>
            )}
            {showAvoid && (
              <div className="rec-banner rec-avoid">
                ✕ Evită cu orice preț — scor publicului {pct}%
              </div>
            )}

            <div className="modal-tags">
              {movie.rating !== '-' && <span className="modal-tag">⭐ <strong>{movie.rating}</strong> / 10</span>}
              {movie.year && <span className="modal-tag">{movie.year}</span>}
              {movie.rated && <span className="modal-tag">🔞 {movie.rated}</span>}
              {movie.runtime && <span className="modal-tag">⏱ {movie.runtime}</span>}
              {movie.genre && movie.genre.split(', ').map(g => (
                <span key={g} className="modal-tag">{g}</span>
              ))}
            </div>

            {movie.plot && movie.plot !== 'Fără descriere disponibilă.' && (
              <p className="modal-plot">{movie.plot}</p>
            )}

            <div className="modal-people">
              {movie.director && <p><strong>Regie:</strong> {movie.director}</p>}
              {movie.actors && <p><strong>Distribuție:</strong> {movie.actors}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
