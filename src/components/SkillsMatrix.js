import React from 'react';
import './SkillsMatrix.css';

function SkillsMatrix() {
  const skills = [
    {
      name: "HTML",
      level: "Intermediate",
      percentage: 75,
      notes: "Used in multiple projects, semantic markup"
    },
    {
      name: "CSS",
      level: "Advanced",
      percentage: 90,
      notes: "Responsive layouts, animations, Flexbox/Grid"
    },
    {
      name: "JavaScript",
      level: "Intermediate",
      percentage: 70,
      notes: "DOM manipulation, async programming"
    },
    {
      name: "React Native",
      level: "Intermediate",
      percentage: 75,
      notes: "Mobile app development, Expo"
    },
    {
      name: "React.js",
      level: "Advanced",
      percentage: 80,
      notes: "State management, hooks, routing"
    }
  ];

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50'; // Advanced - Green
    if (percentage >= 60) return '#2196F3'; // Intermediate - Blue
    return '#FFC107'; // Beginner - Yellow
  };

  return (
    <div className="skills-matrix">
      <h2>🎯 Skills Matrix</h2>
      <div className="skills-grid">
        {skills.map((skill, index) => {
          const progressColor = getProgressColor(skill.percentage);
          return (
            <div 
              key={index} 
              className="skill-item"
              style={{
                '--skill-color': progressColor // Pass color to CSS
              }}
            >
              <div className="skill-content">
                <div className="skill-header">
                  <h3>{skill.name}</h3>
                  <span className="skill-level" style={{ color: progressColor }}>{skill.level}</span>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{
                      width: `${skill.percentage}%`,
                      backgroundColor: progressColor
                    }}
                  >
                    <span className="progress-text">{skill.percentage}%</span>
                  </div>
                </div>
                <p className="skill-notes">{skill.notes}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SkillsMatrix; 