import React from "react";
import "./Projects.css";

function Projects() {
  const projects = [
    {
      name: "Online Marketplace",
      description: "A React and Node.js-based marketplace for users to buy and sell products.",
      stack: "React.js, Node.js, Firebase, Redux",
      link: "https://github.com/J3ZZ3/Marketplace",
      demo: "https://marketplace-2wv4.vercel.app/",
    },
    {
      name: "Employee Management System",
      description: "A CRUD application to manage employee details with authentication and admin functionalities.",
      stack: "React.js, Firebase, Node.js, Express.js",
      link: "https://github.com/J3ZZ3/employeeApp-frontend",
      demo: "https://employeeapp-final.vercel.app/t",
    },
    {
      name: "Audio Recorder App",
      description: "A React Native app for recording and managing voice notes.",
      stack: "React Native",
      link: "https://github.com/J3ZZ3/Audio_Recorder/tree/preview",
      apk: "https://drive.google.com/file/d/1UG-QOMhotIiU7aVgmwqrTLXDnqykByFx/view?usp=drive_link",
    },
    {
      name: "Weather App",
      description: "A modern, responsive weather app that provides real-time weather information, hourly forecasts, and weekly forecasts.",
      stack: "React, Css, WeatherAPI.com, Axios",
      link: "https://github.com/J3ZZ3/weather-app",
      demo: "https://weatherapplj.vercel.app/",
    }
  ];

  return (
    <div className="projects">
      <h2>🚀 Projects</h2>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <div key={index} className="project">
            <h3>{project.name}</h3>
            <p className="description">{project.description}</p>
            <p className="tech-stack"><strong>Tech Stack:</strong> {project.stack}</p>
            <div className="links">
              {project.frontend && (
                <a href={project.frontend} target="_blank" rel="noopener noreferrer">Frontend</a>
              )}
              {project.backend && (
                <a href={project.backend} target="_blank" rel="noopener noreferrer">Backend</a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer">Demo</a>
              )}
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer">View Project</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
