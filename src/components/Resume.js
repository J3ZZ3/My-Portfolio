import React from 'react';
import './Resume.css';

function Resume() {
  return (
    <div className="resume-section">
      <h2>📄 Resume</h2>
      <div className="resume-content">
        <div className="resume-header">
          <p>Junior Developer Trainee</p>
          <p>Location: Pretoria</p>
          <p>Program: CodeTribe</p>
        </div>
        
        <div className="resume-download">
          <a href="https://drive.google.com/file/d/1XwhKwkeplYalkBMwF79RjFJEHNqGuuk-/view"
             className="download-btn"
             target="_blank" 
             rel="noopener noreferrer">
              <span>View Resume</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Resume; 
