import React from 'react';
import { Link } from 'react-router-dom';
import 'C:/Users/hp/Desktop/Final Project/ASTU AlumniLink/frontend/src/styles/Dashboard.css'

const StudentDashboard = () => {
    return (
        <div className="dashboard-container">
            <h1>Welcome to Your Dashboard</h1>
            <div className="dashboard-content">
                <section className="dashboard-section">
                    <h2>Your Courses</h2>
                    <ul>
                        <li><Link to="/courses/course1">Course 1</Link></li>
                        <li><Link to="/courses/course2">Course 2</Link></li>
                        <li><Link to="/courses/course3">Course 3</Link></li>
                    </ul>
                </section>

                <section className="dashboard-section">
                    <h2>Upcoming Events</h2>
                    <ul>
                        <li>Event 1: <Link to="/events/event1">Details</Link></li>
                        <li>Event 2: <Link to="/events/event2">Details</Link></li>
                    </ul>
                </section>

                <section className="dashboard-section">
                    <h2>Your Profile</h2>
                    <p>
                        <Link to="/profile">View Profile</Link>
                    </p>
                </section>

                <section className="dashboard-section">
                    <h2>Create New Event</h2>
                    <p>
                        <Link to="/create_event">Create Event</Link>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default StudentDashboard;