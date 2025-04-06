import React from "react";
import { useNavigate } from "react-router-dom";
import "./ShowCard.css";

const ShowCard = ({ show }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/show/${show.id}`, { state: { show } });
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
    </div>
  );
};

export default ShowCard;
