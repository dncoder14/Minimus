import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">🎬 Minimus</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVmaze</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
