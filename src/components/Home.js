import React from "react";
import "./Home.css";
import ColorLine from './ColorLine'; // Import the ColorLine component
import logo from './images/name.png'; // Adjust the path as necessary
import profilePic from './images/profile.jpg'; // Add your profile picture

function Home() {
  return (
    <div className="home">
      <div className="profile-section">
        <img src={profilePic} alt="Jesse Mashoana" className="profile-pic" />
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <ColorLine /> 
      <p>
        Welcome to my portfolio! I am a dedicated and results-driven Junior Developer with a passion for crafting functional, user-friendly, and visually engaging applications. My goal is to create innovative solutions that address real-world challenges, combining creativity with technical expertise.
      </p>
      <p>
        I thrive in dynamic environments where I can collaborate with others, tackle complex problems, and continuously expand my skill set. Whether it's optimizing performance, enhancing user experiences, or building intuitive interfaces, I approach each project with a commitment to excellence and a growth mindset.
      </p>
    </div>
  );
}

export default Home;
