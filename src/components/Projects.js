import React from "react";
import "./Projects.css";

function Projects() {
  const projects = [
    {
      name: "Online Marketplace",
      description: "A React and Node.js-based marketplace for users to buy and sell products.",
      stack: "React.js, Node.js, Firebase, Redux",
      frontend_repo: "https://github.com/J3ZZ3/Marketplace",
      backend_repo: "https://github.com/J3ZZ3/Marketplace_Server",
      demo: "https://marketplace-2wv4.vercel.app/",
    },
    {
      name: "Employee Management System",
      description: "A CRUD application to manage employee details with authentication and admin functionalities.",
      stack: "React.js, CSS, JavaScipt, Local storage",
      repo: "https://github.com/J3ZZ3/Employeeapp_final",
      demo: "https://employeeapp-final.vercel.app/",
    },
    {
      name: "Audio Recorder App",
      description: "A React Native app for recording and managing voice notes.",
      stack: "React Native",
      repo: "https://github.com/J3ZZ3/AudioRecorderApp",
      apk: "https://drive.google.com/file/d/1UG-QOMhotIiU7aVgmwqrTLXDnqykByFx/view?usp=drive_link",
    },
    {
      name: "Recipe Management Application",
      description: "A recipe website to discover and learn womderful meals across the world.",
      stack: "React.js, Supabase, External API: MealDB API, Authentication: Supabase Auth, Storage: Supabase Storage, PDF Generation: jsPDF",
      repo:"",
      demo: "https://recipehub-jade.vercel.app/",
    },
    {
      name: "Weather App",
      description: "A weather application built with React.js that allows users to search for weather information by city name or live location.",
      stack: "React.js, Css, WeatherAPI.com ,Axios, React Router",
      repo: "https://github.com/J3ZZ3/weather-app",
      demo: "https://weatherapp-sage-sigma.vercel.app/",
    },
    {
      name: "Task Management Application",
      description: "This project is a To Do List Application built with React. It allows users to create, edit, delete, and manage tasks efficiently. The application features user authentication, profile management, and a visually appealing interface with animations..",
      stack: "React.js, React Router, Local Storage, React Spring",
      repo: "https://github.com/J3ZZ3/weather-app",
      link: "https://to-do-list-two-omega-57.vercel.app/",
    }
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
              {project.frontend_repo && (
                <a href={project.frontend_repo} target="_blank" rel="noopener noreferrer">Frontend Repo</a>
              )}
              {project.backend_repo && (
                <a href={project.backend_repo} target="_blank" rel="noopener noreferrer">Backend Repo</a>
              )}
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noopener noreferrer">Repo</a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer">Demo</a>
              )}
              {project.apk && (
                <a href={project.apk} target="_blank" rel="noopener noreferrer">Apk</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
