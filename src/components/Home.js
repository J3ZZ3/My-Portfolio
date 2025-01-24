import React from "react";
import "./Home.css";

function Home() {
  return (
    <div className="home">
      <h2>👋 Hello! I'm Jesse Mashoana</h2>
      <p>
        Welcome to my portfolio! I'm a <strong>Junior Developer</strong> passionate about building
        functional and user-friendly applications. I enjoy solving real-world problems while
        constantly learning and improving my skills.
      </p>
      <h3>🚀 Skills & Tools</h3>
      <ul>
        <li><strong>Frontend:</strong> JavaScript (ES6+), HTML5, CSS3, React.js</li>
        <li><strong>Backend:</strong> Node.js, Express.js</li>
        <li><strong>Database:</strong> Firebase, Firestore, MongoDB (Basic)</li>
        <li><strong>Tools:</strong> Git, GitHub, Postman, VS Code</li>
      </ul>
    </div>
  );
}

export default Home;
