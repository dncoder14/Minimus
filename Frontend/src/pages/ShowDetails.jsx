import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ShowDetails.css";

const ShowDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`https://api.tvmaze.com/shows/${id}`)
      .then(res => setShow(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!show) return <p className="loading">Loading...</p>;

  return (
    <div className="details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="details-card">
        <img className="details-image" src={show.image?.original} alt={show.name} />
        <div className="details-content">
          <h1>{show.name}</h1>
          <p dangerouslySetInnerHTML={{ __html: show.summary }} />
          <p><strong>Language:</strong> {show.language}</p>
          <p><strong>Genres:</strong> {show.genres.join(", ")}</p>
          <p><strong>Rating:</strong> {show.rating.average || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default ShowDetails;
