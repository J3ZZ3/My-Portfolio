import React from "react";
import "./Projects.css";

function Projects() {
  const projects = [
    {
      name: "Online Marketplace",
      description: "A React and Node.js-based marketplace for users to buy and sell products.",
      stack: "React.js, Node.js, Firebase, Redux",
      frontend: "https://github.com/J3ZZ3/Marketplace",
      backend: "https://github.com/J3ZZ3/Marketplace_Server",
    },
    {
      name: "Employee Management System",
      description: "A CRUD application to manage employee details with authentication and admin functionalities.",
      stack: "React.js, Firebase, Node.js, Express.js",
      frontend: "https://github.com/J3ZZ3/employeeApp-frontend",
      backend: "https://github.com/J3ZZ3/employeeApp-backend",
    },
    {
      name: "Audio Recorder App",
      description: "A React Native app for recording and managing voice notes.",
      stack: "React Native",
      link: "https://github.com/J3ZZ3/AudioRecorderApp",
    },
  ];

  return (
    <div className="projects">
      <h2>🛠️ Projects</h2>
      {projects.map((project, index) => (
        <div key={index} className="project">
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <p><strong>Tech Stack:</strong> {project.stack}</p>
          <div className="links">
            {project.frontend && (
              <a href={project.frontend} target="_blank" rel="noopener noreferrer">Frontend</a>
            )}
            {project.backend && (
              <a href={project.backend} target="_blank" rel="noopener noreferrer">Backend</a>
            )}
            {project.link && (
              <a href={project.link} target="_blank" rel="noopener noreferrer">GitHub</a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Projects;
