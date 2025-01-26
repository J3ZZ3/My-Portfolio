import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReact } from '@fortawesome/free-brands-svg-icons'; // Using React icon as a placeholder

const ReactNativeIcon = () => {
    return (
        <div className="icon-item">
            <FontAwesomeIcon icon={faReact} size="3x" className="custom-icon" />
            React Native (Expo)
        </div>
    );
};

export default ReactNativeIcon; 