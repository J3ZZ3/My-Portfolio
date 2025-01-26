import React from "react";
import { faJs, faHtml5, faCss3Alt, faReact, faGit, faGithub } from '@fortawesome/free-brands-svg-icons';
import SkillIcon from './SkillIcon';
import ReactNativeIcon from './ReactNativeIcon';
import PostmanIcon from './PostmanIcon';
import FirebaseIcon from './images/firebase.svg';
import MongoDBIcon from './images/mongodb.svg';
import SupabaseIcon from './images/supabase.svg';
import "./TechStack.css";

function TechStack() {
  return (
    <div className="techstack">
      <h3>⚙️ Skills & Tools</h3>
      <div className="icon-grid">
        <SkillIcon icon={faJs} label="JavaScript" />
        <SkillIcon icon={faHtml5} label="HTML5" />
        <SkillIcon icon={faCss3Alt} label="CSS3" />
        <SkillIcon icon={faReact} label="React.js" />
        <SkillIcon icon={faGit} label="Git" />
        <SkillIcon icon={faGithub} label="GitHub" />
        <SkillIcon icon={FirebaseIcon} label="Firebase" />
        <SkillIcon icon={MongoDBIcon} label="MongoDB" />
        <SkillIcon icon={SupabaseIcon} label="Supabase" />
        <ReactNativeIcon />
        <PostmanIcon />
      </div>
    </div>
  );
}

export default TechStack;
