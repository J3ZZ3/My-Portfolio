import React from "react";
import "./Overview.css"; // Create a CSS file for styling
import bottomGif from './images/bottom.gif'; // Import the bottom GIF
import topGif from './images/top.gif'; // Import the new top GIF

function Overview() {
  return (
    <div className="overview">
      <img src={topGif} alt="Top Overview GIF" className="overview-top-gif" />
      <img src={bottomGif} alt="Bottom Overview GIF" className="overview-gif" />
    </div>
  );
}

export default Overview; 