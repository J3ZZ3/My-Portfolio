import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SkillIcon = ({ icon, label }) => {
    return (
        <div className="icon-item">
            {typeof icon === 'string' ? (
                <img src={icon} alt={label} className="custom-icon" />
            ) : (
                <FontAwesomeIcon icon={icon} size="5x" />
            )}
            <span>{label}</span>
        </div>
    );
};

export default SkillIcon; 