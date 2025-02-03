import React, { useState, useEffect } from "react";
import "./Overview.css";
import bottomGif from './images/bottom.gif';
import topGif from './images/top.gif';
import { FaHome, FaFileAlt, FaChartBar, FaLayerGroup, FaRocket, FaEnvelope, FaBars, FaTimes } from 'react-icons/fa';

function Overview() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isMobile && (
        <button 
          className={`menu-toggle ${isOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      )}
      <nav className={`overview ${isOpen ? 'show' : ''}`}>
        <img src={topGif} alt="Top Overview GIF" className="overview-top-gif" />
        <ul>
          <li>
            <a href="#home" onClick={closeMenu}>
              <FaHome className="nav-icon" />
              <span>Bio</span>
            </a>
          </li>
          <li>
            <a href="#resume" onClick={closeMenu}>
              <FaFileAlt className="nav-icon" />
              <span>Resume</span>
            </a>
          </li>
          <li>
            <a href="#skills" onClick={closeMenu}>
              <FaChartBar className="nav-icon" />
              <span>Skills Matrix</span>
            </a>
          </li>
          <li>
            <a href="#techstack" onClick={closeMenu}>
              <FaLayerGroup className="nav-icon" />
              <span>Tech Stack</span>
            </a>
          </li>
          <li>
            <a href="#projects" onClick={closeMenu}>
              <FaRocket className="nav-icon" />
              <span>Projects</span>
            </a>
          </li>
          <li>
            <a href="#contact" onClick={closeMenu}>
              <FaEnvelope className="nav-icon" />
              <span>Contact</span>
            </a>
          </li>
        </ul>
        <img src={bottomGif} alt="Bottom Overview GIF" className="overview-gif" />
      </nav>
    </>
  );
}

export default Overview; 