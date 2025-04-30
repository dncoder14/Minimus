import React, { useEffect, useState } from "react";
import ShowCard from "../components/ShowCard";
import "./Home.css";

const Home = () => {
  const [shows, setShows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 28;

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch("https://api.tvmaze.com/shows");
        const data = await response.json();
        setShows(data);
      } catch (error) {
        console.error("Error fetching shows:", error);
      }
    };
    fetchShows();
  }, []);

  // Build genre list for the filter dropdown
  const genres = ["All", ...Array.from(
    new Set(shows.flatMap((show) => show.genres))
  )];

  // 1) Filter by search term
  let processed = shows.filter((show) =>
    show.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2) Filter by genre
  if (selectedGenre !== "All") {
    processed = processed.filter((show) =>
      show.genres.includes(selectedGenre)
    );
  }

  // 3) Sort alphabetically
  processed = processed.sort((a, b) =>
    sortOrder === "asc"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  );

  // 4) Pagination calculations
  const totalPages = Math.ceil(processed.length / itemsPerPage);
  const showsToDisplay = processed.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);
  const prevPage = () =>
    currentPage > 1 && setCurrentPage((p) => p - 1);

  return (
    <div className="home-container">
      <h1>TV Show Encyclopedia</h1>

      <div className="controls">
        {/* Search */}
        <input
          type="text"
          placeholder="Search shows..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="search-bar"
        />

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="search-bar"
        >
          <option value="asc">Sort A–Z</option>
          <option value="desc">Sort Z–A</option>
        </select>

        {/* Genre Filter */}
        <select
          value={selectedGenre}
          onChange={(e) => {
            setSelectedGenre(e.target.value);
            setCurrentPage(1);
          }}
          className="search-bar"
        >
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="show-list">
        {showsToDisplay.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>

      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Home;
