import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faCalendar, faMapPin, faUsers, faShare, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const BrowseInternship = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile } = location.state || {};
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState({});
    const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
    const userDepartment = profile?.department;
    const today = new Date('2025-05-14');


    useEffect(() => {
        const fetchInternships = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/events/internships/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch internships');
                }
                const data = await response.json();
                const internshipArray = Array.isArray(data) ? data : [data];
                const sortedInternships = internshipArray.sort((a, b) => {
                    const aStart = new Date(a.start_date);
                    const aEligible = aStart > today && a.departments.includes(userDepartment);
                    const bStart = new Date(b.start_date);
                    const bEligible = bStart > today && b.departments.includes(userDepartment);
                    return (bEligible - aEligible) || (aStart - bStart);
                });
                setInternships(sortedInternships);
            } catch (err) {
                toast.error("Error fetching internships: " + err.message, { position: "top-right" });
                setError('Failed to load internships.');
            } finally {
                setLoading(false);
            }
        };
        fetchInternships();
    }, [BASE_URL, userDepartment]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDepartments = (departments) => {
        return Array.isArray(departments) ? departments.join(', ') : 'Not specified';
    };

    console.log("User Department", userDepartment);
    const getInternshipStatus = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start < today) return 'past';
        if (start <= today && today <= end) return 'ongoing';
        return 'future';
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'past':
                return { bg: 'bg-gray-200', text: 'text-gray-500' };
            case 'ongoing':
                return { bg: 'bg-green-100', text: 'text-green-700' };
            case 'future':
                return { bg: 'bg-blue-100', text: 'text-blue-700' };
            default:
                return { bg: 'bg-white', text: 'text-gray-600' };
        }
    };

    const toggleExpanded = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleApply = (id) => {
        navigate(`/apply-internship/${id}`, { state: { user, profile } });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500 text-center text-xl mt-10">{error}</p>;
    }
console.log("Internship", internships);
    return (
        <div className="bg-gray-100 min-h-screen p-6 dark:bg-gray-900 regform_body">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center dark_text">
                    Browse Internship Opportunities
                </h1>
                {internships.length === 0 ? (
                    <p className="text-gray-600 text-center text-lg">
                        No internships available at the moment.
                    </p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {internships.map((internship) => {
                            const status = getInternshipStatus(internship.start_date, internship.end_date);
                            const { bg, text } = getStatusStyles(status);
                            const canApply = status === 'future' && internship.departments.includes(userDepartment);
                            const company = internship.company_profile;
                            const isExpanded = expanded[internship.id];

                            return (
                                <div
                                    key={internship.id}
                                    className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 contact-form ${bg}`}
                                >
                                    <h2 className={`text-2xl font-bold mb-4 ${text}`}>
                                        {internship.title}
                                        <span className="text-sm ml-2 capitalize">({status})</span>
                                    </h2>
                                    <p className={`text-lg mb-4 flex items-center ${text}`}>
                                        <FontAwesomeIcon icon={faCalendar} className="mr-2 text-orange-500" />
                                        <span className="font-semibold mr-2">Duration:</span>
                                        {formatDate(internship.start_date)} - {formatDate(internship.end_date)}
                                    </p>
                                    <p className={`text-lg mb-4 flex items-center ${text}`}>
                                        <FontAwesomeIcon icon={faUsers} className="mr-2 text-orange-500" />
                                        <span className="font-semibold mr-2">Departments:</span>
                                        {formatDepartments(internship.departments)}
                                    </p>
                                    {isExpanded && (
                                        <>
                                            <p className={`text-lg mb-4 flex items-center ${text}`}>
                                                <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-orange-500" />
                                                <span className="font-semibold mr-2">Description:</span>
                                                {internship.description || 'Not provided'}
                                            </p>
                                            <p className={`text-lg mb-4 flex items-center ${text}`}>
                                                <FontAwesomeIcon icon={faMapPin} className="mr-2 text-orange-500" />
                                                <span className="font-semibold mr-2">Area:</span>
                                                {internship.area || 'Not specified'}
                                            </p>
                                            <p className={`text-lg mb-4 ${text}`}>
                                                <span className="font-semibold">Created On:</span> {formatDate(internship.created_on)}
                                            </p>
                                          
                                            <p className={`text-lg mb-4 ${text}`}>
                                                <span className="font-semibold">Created By:</span>{' '}
                                                {company?.user?.full_name || 'Unknown'}
                                            </p>
                                            <p className={`text-lg mb-4 ${text}`}>
                                                <span className="font-semibold">Location:</span>{' '}
                                                {company?.company_address || ''}, {company?.company_city || ''}, {company?.company_country || ''}
                                            </p>
                                        </>
                                    )}
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => toggleExpanded(internship.id)}
                                            className="mt-4 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-white hover:to-white hover:text-gray-600 hover:border-gray-600 border transition-all duration-300 transform hover:scale-105"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <FontAwesomeIcon icon={faEyeSlash} className="mr-2" />
                                                    View Less
                                                </>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faEye} className="mr-2" />
                                                    View More
                                                </>
                                            )}
                                        </button>
                                        {canApply && (
                                            <button
                                                onClick={() => handleApply(internship.id)}
                                                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-white hover:to-white hover:text-blue-600 hover:border-blue-600 border transition-all duration-300 transform hover:scale-105"
                                            >
                                                Apply Now
                                            </button>
                                        )}
                                    </div>
                                    {!canApply && !internship.departments.includes(userDepartment) && (
                                        <p className={`text-lg mt-4 italic flex items-center ${text}`}>
                                            <FontAwesomeIcon icon={faShare} className="mr-2 text-orange-500" />
                                            This internship is not for your department. Tell your friends!
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseInternship;
