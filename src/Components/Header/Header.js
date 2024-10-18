import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import "./header.css";

const Header = () => {
    return(
        <div className="header">
            <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: "2em" }} />
            <h2>Task Board</h2>
        </div>
    );
};

export default Header;