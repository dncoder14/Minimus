import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ShowDetails from './pages/ShowDetails';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Watchlist from './pages/Watchlist';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/show/:id" element={<ShowDetails />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;