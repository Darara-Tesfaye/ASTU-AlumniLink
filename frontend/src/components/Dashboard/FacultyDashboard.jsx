import React from 'react';
import { useLocation } from 'react-router-dom';

const FacultyDashboard = () => {
    const location = useLocation();
    const { user , profile } = location.state || {};
    const usertype = user.usertype;
    console.log("User", user);
console.log("Profile", profile);
    return (
        <div>
            <h2>Faculty Dashboard</h2>
            <p>Welcome, faculty! Manage your courses and interact with students.</p>
            {/* Add more faculty-specific features here */}
        </div>
    );
};

export default FacultyDashboard;