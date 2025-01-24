import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faProjectDiagram, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import "./Overview.css"; // Create a CSS file for styling

function Overview() {
  return (
    <div className="overview">
      <h2>Overview</h2>
      <ul>
        <li>
          <a href="#home" title="Home">
            <FontAwesomeIcon icon={faHome} size="2x" />
          </a>
        </li>
        <li>
          <a href="#projects" title="Projects">
            <FontAwesomeIcon icon={faProjectDiagram} size="2x" />
          </a>
        </li>
        <li>
          <a href="#contact" title="Contact">
            <FontAwesomeIcon icon={faEnvelope} size="2x" />
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Overview; 