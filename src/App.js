import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Overview from './components/Overview';
import Home from './components/Home';
import TechStack from './components/TechStack';
import Projects from './components/Projects';
import Contact from './components/Contact';
import ColorLine from './components/ColorLine';
import Resume from './components/Resume';
import SkillsMatrix from './components/SkillsMatrix';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <div className="content">
          <Overview />
          <div className="sections">
            <section id="home">
              <Home />
            </section>
    <ColorLine/>
    <section id="resume">
    <Resume/>
    </section>
    <ColorLine/>
            <section id="skills">
              <SkillsMatrix />
            </section>
            <ColorLine />
            <section id="techstack">
              <TechStack />
            </section>
            <ColorLine />
            <section id="projects">
              <Projects />
            </section>
            <ColorLine />
            <section id="contact">
              <Contact />
            </section>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
