import React, { useState } from 'react';
import StudentProfile from "./Student";
import AlumniProfile from "./AlumniProfile";
import CompanyProfile from "./Company";
import { useLocation } from 'react-router-dom';
import FacultyProfile from './Staff';

const UserProfile = () => {
    const location = useLocation();
    const { user, profile } = location.state || {};
    const usertype = user.usertype;
    return (
        <div>
            {usertype === 'student' && <StudentProfile/>}
            {usertype === 'Alumni' && <AlumniProfile />}
            {usertype === 'staff' && <FacultyProfile />}
            {usertype === 'company' && <CompanyProfile />}
        </div>
    );
};
export default UserProfile;