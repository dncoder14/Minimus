import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Minimus. All rights reserved.</p>
      <div className="footer-links">
        <a href="https://github.com/dncoder14" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.tvmaze.com/api" target="_blank" rel="noopener noreferrer">TVmaze API</a>
      </div>
    </footer>
  );
};

export default Footer;
