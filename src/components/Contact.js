import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'; // Keep the envelope icon
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'; // Import from the brands package
import "./Contact.css";

function Contact() {
  return (
    <div className="contact">
      <h2>📫 Contact Me</h2>
      <div className="icon-container">
        <a href="mailto:jesse.mashoana@gmail.com" aria-label="Email">
          <FontAwesomeIcon icon={faEnvelope} size="5x" />
        </a>
        <a href="https://github.com/J3ZZ3" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <FontAwesomeIcon icon={faGithub} size="5x" />
        </a>
        <a href="https://www.linkedin.com/in/jesse-mashoana/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <FontAwesomeIcon icon={faLinkedin} size="5x" />
        </a>
      </div>
    </div>
  );
}

export default Contact;
