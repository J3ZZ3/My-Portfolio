import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Overview from './components/Overview';
import Home from './components/Home';
import TechStack from './components/TechStack';
import Projects from './components/Projects';
import Contact from './components/Contact';
import ColorLine from './components/ColorLine';
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
            <ColorLine /> {/* Use the ColorLine component */}
            <section id="techstack">
              <TechStack />
            </section>
            <ColorLine /> {/* Use the ColorLine component */}
            <section id="projects">
              <Projects />
            </section>
            <ColorLine /> {/* Use the ColorLine component */}
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
