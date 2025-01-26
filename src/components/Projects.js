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
      demo: "https://your-demo-link.com/marketplace",
    },
    {
      name: "Employee Management System",
      description: "A CRUD application to manage employee details with authentication and admin functionalities.",
      stack: "React.js, Firebase, Node.js, Express.js",
      frontend: "https://github.com/J3ZZ3/employeeApp-frontend",
      backend: "https://github.com/J3ZZ3/employeeApp-backend",
      demo: "https://your-demo-link.com/employee-management",
    },
    {
      name: "Audio Recorder App",
      description: "A React Native app for recording and managing voice notes.",
      stack: "React Native",
      link: "https://github.com/J3ZZ3/AudioRecorderApp",
      demo: "https://your-demo-link.com/audio-recorder",
    },
    {
      name: "Project 4",
      description: "Description for project 4.",
      stack: "Tech Stack for project 4",
      link: "#",
    },
    {
      name: "Project 5",
      description: "Description for project 5.",
      stack: "Tech Stack for project 5",
      link: "#",
    },
    {
      name: "Project 6",
      description: "Description for project 6.",
      stack: "Tech Stack for project 6",
      link: "#",
    },
    {
      name: "Project 7",
      description: "Description for project 7.",
      stack: "Tech Stack for project 7",
      link: "#",
    },
    {
      name: "Project 8",
      description: "Description for project 8.",
      stack: "Tech Stack for project 8",
      link: "#",
    },
    {
      name: "Project 9",
      description: "Description for project 9.",
      stack: "Tech Stack for project 9",
      link: "#",
    },
  ];

  return (
    <div className="projects">
      <h2>🚀 Projects</h2>
      <div className="projects-grid">
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
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer">Demo</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
