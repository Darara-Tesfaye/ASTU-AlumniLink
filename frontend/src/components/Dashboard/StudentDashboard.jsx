
import React from 'react';
import { useLocation } from 'react-router-dom'

const StudentDashboard = () => {
    const location = useLocation();
    const { usertype } = location.state || {}; // Access the passed usertype
    return (
        <div>
            <h2>Student Dashboard</h2>
            <p>Welcome, student! Here you can find your courses, grades, and more.</p>
            
            {/* Add more student-specific features here */}
        </div>
    );
};

export default StudentDashboard;