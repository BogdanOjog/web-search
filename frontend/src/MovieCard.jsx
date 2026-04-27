export default function MovieCard({ movie, onOpen, onDelete }) {
  return (
    <article className="movie-card" onClick={() => onOpen(movie)}>
      <img
        src={movie.poster}
        alt={movie.title}
        className="card-poster"
        onError={(e) => { e.target.src = 'https://placehold.co/180x270/13131a/c9a84c?text=N%2FA'; }}
      />
      <div className="card-body">
        <h3 className="card-title">{movie.title}</h3>
        <div className="card-meta">
          {movie.rating !== '-' && <span className="card-rating">★ {movie.rating}</span>}
          {movie.year && <span className="card-year">{movie.year}</span>}
        </div>
      </div>
      <button
        className="btn-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(movie._id); }}
      >
        Șterge
      </button>
    </article>
  );
}
