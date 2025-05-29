import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faCalendar, faMapPin, faUsers, faShare, faEye, faEyeSlash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const BrowseJob = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile } = location.state || {};
    const [jobs, setJobs] = useState([]);
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState({});
    const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
    const userFieldOfStudy = profile?.field_of_study || 'computerScience';
    const userId = user?.id;
    const today = new Date('2025-05-15T22:23:00Z'); 

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                toast.error("Please log in to view jobs.", { position: "top-right" });
                navigate('/login');
                return;
            }
            setLoading(true);
            try {
                const jobsResponse = await fetch(`${BASE_URL}/events/jobs/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    },
                });
                if (!jobsResponse.ok) {
                    throw new Error('Failed to fetch jobs');
                }
                const jobsData = await jobsResponse.json();
                console.log("Fetched jobs:", jobsData);
                const jobArray = Array.isArray(jobsData) ? jobsData : [jobsData];

                const appliedResponse = await fetch(`${BASE_URL}/events/job-applied/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    },
                });
                if (!appliedResponse.ok) {
                    if (appliedResponse.status === 401) {
                        throw new Error("Unauthorized. Please log in.");
                    }
                    throw new Error('Failed to fetch applied jobs');
                }
                const appliedData = await appliedResponse.json();
                console.log("Fetched applied jobs:", appliedData);
                const appliedIds = new Set(appliedData.map(app => app.job.id));
                setAppliedJobIds(appliedIds);

                const sortedJobs = jobArray.sort((a, b) => {
                    const aCreated = new Date(a.created_on);
                    const aEligible = isWithinOneMonth(aCreated) && a.field_of_study === userFieldOfStudy;
                    const bCreated = new Date(b.created_on);
                    const bEligible = isWithinOneMonth(bCreated) && b.field_of_study === userFieldOfStudy;
                    if (aEligible !== bEligible) return bEligible - aEligible;
                    return bCreated - aCreated;
                });
                setJobs(sortedJobs);
            } catch (err) {
                toast.error("Error: " + err.message, { position: "top-right" });
                setError('Failed to load jobs.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [BASE_URL, userFieldOfStudy, userId, navigate]);

    const isWithinOneMonth = (createdDate) => {
        const oneMonthLater = new Date(createdDate);
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        return today <= oneMonthLater;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatFieldOfStudy = (fieldOfStudy) => {
        return fieldOfStudy || 'Not specified';
    };

    const getJobStatus = (createdDate) => {
        return isWithinOneMonth(new Date(createdDate)) ? 'future' : 'past';
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'past':
                return { bg: 'bg-gray-200', text: 'text-gray-500' };
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
        navigate(`/apply-job/${id}`, { state: { user, profile } });
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

    console.log("Jobs:", jobs);
    console.log("Applied Job IDs:", Array.from(appliedJobIds));

    return (
        <div className="bg-gray-100 min-h-screen p-6 dark:bg-gray-900 regform_body">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center dark_text">
                    Browse Job Opportunities
                </h1>
                {jobs.length === 0 ? (
                    <p className="text-gray-600 text-center text-lg">
                        No jobs available at the moment.
                    </p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {jobs.map((job) => {
                            const status = getJobStatus(job.created_on);
                            const { bg, text } = getStatusStyles(status);
                            const canApply = status === 'future' && job.field_of_study === userFieldOfStudy;
                            const hasApplied = appliedJobIds.has(job.id);
                            const company = job.company_profile;
                            const isExpanded = expanded[job.id];

                            return (
                                <div
                                    key={job.id}
                                    className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 contact-form ${bg}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h2 className={`text-2xl font-bold mb-4 ${text}`}>
                                            {job.title}
                                            <span className="text-sm ml-2 capitalize">({status})</span>
                                        </h2>
                                        {hasApplied && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                                Applied
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-lg mb-4 flex items-center ${text}`}>
                                        <FontAwesomeIcon icon={faCalendar} className="mr-2 text-orange-500" />
                                        <span className="font-semibold mr-2">Posted On:</span>
                                        {formatDate(job.created_on)}
                                    </p>
                                    <p className={`text-lg mb-4 flex items-center ${text}`}>
                                        <FontAwesomeIcon icon={faUsers} className="mr-2 text-orange-500" />
                                        <span className="font-semibold mr-2">Field of Study:</span>
                                        {formatFieldOfStudy(job.field_of_study)}
                                    </p>
                                    {isExpanded && (
                                        <>
                                            <p className={`text-lg mb-4 flex items-center ${text}`}>
                                                <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-orange-500" />
                                                <span className="font-semibold mr-2">Description:</span>
                                                {job.description || 'Not provided'}
                                            </p>
                                            <p className={`text-lg mb-4 ${text}`}>
                                                <span className="font-semibold">Approved:</span> {job.is_approved ? 'Yes' : 'No'}
                                            </p>
                                            <p className={`text-lg mb-4 ${text}`}>
                                                <span className="font-semibold">Created By:</span>{' '}
                                                {company?.user?.full_name || 'Unknown'}
                                            </p>
                                            <p className={`text-lg mb-4 ${text}`}>
                                                <span className="font-semibold">Location:</span>{' '}
                                                {company?.company_address || ''}, {company?.company_city || ''}, {company?.company_country || ''}
                                            </p>
                                            <p className={`text-lg mb-4 ${text}`}>
                                                <span className="font-semibold">Salary:</span> {job.salary || 'Not specified'}
                                            </p>
                                        </>
                                    )}
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => toggleExpanded(job.id)}
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
                                        {canApply && !hasApplied && (
                                            <button
                                                onClick={() => handleApply(job.id)}
                                                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-white hover:to-white hover:text-blue-600 hover:border-blue-600 border transition-all duration-300 transform hover:scale-105"
                                            >
                                                Apply Now
                                            </button>
                                        )}
                                        {canApply && hasApplied && (
                                            <button
                                                disabled
                                                className="mt-4 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed opacity-50"
                                            >
                                                Applied
                                            </button>
                                        )}
                                    </div>
                                    {!canApply && job.field_of_study !== userFieldOfStudy && (
                                        <p className={`text-lg mt-4 italic flex items-center ${text}`}>
                                            <FontAwesomeIcon icon={faShare} className="mr-2 text-orange-500" />
                                            This job is not for your field of study. Tell your friends!
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

export default BrowseJob;