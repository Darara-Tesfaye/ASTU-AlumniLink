
import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/LandingPage.css"


const LandingPage = () => {
    return (
        <div className="landing-container">
            <h1>Welcome to ASTU Alumni Link</h1>
            <p>
                Connect with fellow alumni, stay updated on events, and explore opportunities.
            </p>
            <div className="landing-buttons">
                <Link to="/login" className="button">Login</Link>
                <Link to="/register" className="button">Register</Link>
            </div>
        </div>
    );
};

export default LandingPage;