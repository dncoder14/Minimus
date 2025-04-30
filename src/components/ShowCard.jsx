import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ShowCard.css";

const ShowCard = ({ show }) => {
  const navigate = useNavigate();
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    setIsOnWatchlist(watchlist.some(item => item.id === show.id));

    const likedShows = JSON.parse(localStorage.getItem('likedShows')) || {};
    setIsLiked(likedShows[show.id] || false);
  }, [show.id]);

  const handleClick = () => {
    navigate(`/show/${show.id}`, { state: { show } });
  };

  const handleAddToWatchlist = (e) => {
    e.stopPropagation();
    const existingList = JSON.parse(localStorage.getItem('watchlist')) || [];
    const isAlreadyAdded = existingList.some(item => item.id === show.id);

    if (!isAlreadyAdded) {
      existingList.push(show);
      localStorage.setItem('watchlist', JSON.stringify(existingList));
      setIsOnWatchlist(true);
      alert(`${show.name} added to watchlist!`);
    } else {
      const updatedList = existingList.filter(item => item.id !== show.id);
      localStorage.setItem('watchlist', JSON.stringify(updatedList));
      setIsOnWatchlist(false);
      alert(`${show.name} removed from watchlist.`);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const likedShows = JSON.parse(localStorage.getItem('likedShows')) || {};
    const newLikedStatus = !isLiked;
    likedShows[show.id] = newLikedStatus;
    localStorage.setItem('likedShows', JSON.stringify(likedShows));
    setIsLiked(newLikedStatus);
    alert(`${show.name} ${newLikedStatus ? 'liked!' : 'unliked.'}`);
  };

  return (
    <div className="show-card" onClick={handleClick}>
      <img
        src={show.image?.medium || "https://via.placeholder.com/210x295"}
        alt={show.name}
        className="show-image"
      />
      <div className="show-info">
        <h3>{show.name}</h3>
        <p>{show.genres.join(", ")}</p>
      </div>
      <div className="show-actions">
        <button
          onClick={handleLike}
          className={`like-button ${isLiked ? 'liked' : ''}`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
        <button
          onClick={handleAddToWatchlist}
          className={`watchlist-button ${isOnWatchlist ? 'on-watchlist' : ''}`}
          title={isOnWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          {isOnWatchlist ? '✅' : '➕'}
        </button>
      </div>
    </div>
  );
};

export default ShowCard;