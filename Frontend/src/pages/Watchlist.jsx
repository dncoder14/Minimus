import React, { useEffect, useState } from 'react';
import './Watchlist.css';
import { Link } from 'react-router-dom';  // Import Link

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('watchlist')) || [];
    setWatchlist(stored);
  }, []);

  const removeFromWatchlist = (id) => {
    const updated = watchlist.filter(show => show.id !== id);
    setWatchlist(updated);
    localStorage.setItem('watchlist', JSON.stringify(updated));
  };

  return (
    <div className="watchlist-container">
      <h2 className="watchlist-title">My Watchlist</h2>
      {watchlist.length === 0 ? (
        <p className="watchlist-empty">Your watchlist is currently empty. Add some shows!</p>
      ) : (
        <ul className="watchlist-grid">
          {watchlist.map((show) => (
            <li key={show.id} className="watchlist-item">
              <Link to={`/show/${show.id}`} className="watchlist-item-link">  {/* Use Link here */}
                <div className="watchlist-item-image">
                  <img
                    src={show.image?.medium || "https://via.placeholder.com/210x295"}
                    alt={show.name}
                  />
                </div>
                <div className="watchlist-item-details">
                  <h3 className="watchlist-item-title">{show.name}</h3>
                  <p className="watchlist-item-genres">{show.genres?.join(', ') || 'No genres listed'}</p>
                </div>
              </Link>
              <button
                onClick={() => removeFromWatchlist(show.id)}
                className="watchlist-remove-button"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Watchlist;