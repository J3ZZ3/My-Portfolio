import React from "react";
import { ReactComponent as PostmanSVG } from './images/postman.svg'; // Import the SVG as a React component

const PostmanIcon = () => {
    return (
        <div className="icon-item">
            <PostmanSVG className="custom-icon" width="70px" height="70px" fill="#01a9f7" /> {/* Set fill color to match project color */}
            Postman
        </div>
    );
};

export default PostmanIcon; 