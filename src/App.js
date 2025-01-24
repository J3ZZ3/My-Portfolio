import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Overview from './components/Overview';
import Home from './components/Home';
import Projects from './components/Projects';
import Contact from './components/Contact';
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
            <section id="projects">
              <Projects />
            </section>
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
