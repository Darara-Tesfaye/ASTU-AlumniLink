import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ACCESS_TOKEN } from "../../constants";
import LoadingIndicator from "../LoadingIndicator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCheck, faTimes, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";

const JobApplicantPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = location.state || {};
    const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
    const [listOfApplicants, setListOfApplicants] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const email = user?.email;

    useEffect(() => {
        const fetchData = async () => {
            if (!email) {
                toast.error("Please log in to view applicants.", { position: "top-right" });
                navigate('/login');
                return;
            }
            setLoading(true);
            try {
                // Fetch current user (company profile)
                const userResponse = await fetch(`${BASE_URL}/users/company/profile/?email=${encodeURIComponent(email)}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    },
                });
                if (!userResponse.ok) {
                    if (userResponse.status === 404) {
                        throw new Error("Company profile does not exist. Please create a profile.");
                    }
                    throw new Error("Failed to fetch user profile.");
                }
                const userData = await userResponse.json();
                console.log("Fetched user:", userData);
                setCurrentUser(userData);

                // Fetch job applicants
                const applicantsResponse = await fetch(`${BASE_URL}/events/job-applicant/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    },
                });
                if (!applicantsResponse.ok) {
                    if (applicantsResponse.status === 401) {
                        throw new Error("Unauthorized. Please log in.");
                    }
                    throw new Error("Failed to fetch applicants.");
                }
                const applicantsData = await applicantsResponse.json();
                console.log("Fetched job applicants:", applicantsData);

                // Filter applicants by created_by and sort by created_on (descending)
                const filteredApplicants = applicantsData
                    .filter(applicant => applicant.job.created_by === userData.user.id)
                    .sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
                setListOfApplicants(filteredApplicants);
            } catch (error) {
                console.error("Fetch error:", error);
                if (error.message.includes("Company profile does not exist")) {
                    toast.warn(error.message, { position: "top-right" });
                    navigate('/company/profile/edit');
                } else {
                    toast.error(error.message, { position: "top-right" });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [BASE_URL, email, navigate]);

    const handleStatusUpdate = async (jobId, newStatus) => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/events/job-applications/${jobId}/status/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Failed to update status to ${newStatus}.`);
            }
            const updatedApplicant = await response.json();
            console.log("Updated job applicant:", updatedApplicant);
            setListOfApplicants((prev) =>
                prev.map((applicant) =>
                    applicant.job.id === jobId ? { ...applicant, status: newStatus } : applicant
                )
            );
            toast.success(`Application ${newStatus} successfully!`, { position: "top-right" });
        } catch (error) {
            console.error("Update error:", error);
            toast.error(error.message, { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const isMonthNotPast = (dateString) => {
        const date = new Date(dateString);
        const currentDate = new Date('2025-05-15T11:37:00Z'); // May 15, 2025, 11:37 AM EAT
        return date.getFullYear() > currentDate.getFullYear() ||
               (date.getFullYear() === currentDate.getFullYear() && date.getMonth() >= currentDate.getMonth());
    };

    const toggleRow = (applicantId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [applicantId]: !prev[applicantId],
        }));
    };

    if (loading) {
        return <LoadingIndicator />;
    }

    if (!currentUser) {
        return (
            <div className="bg-gray-100 min-h-screen p-6 dark:bg-gray-900 regform_body">
                <ToastContainer />
                <div className="max-w-7xl mx-auto">
                    <p className="text-red-500 text-center text-xl mt-10">
                        Please log in to view applicants.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen p-6 dark:bg-gray-900 regform_body">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center dark_text">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-orange-500" />
                    Job Applicants
                </h1>
                {listOfApplicants.length === 0 ? (
                    <p className="text-gray-600 text-center text-xl">No applicants found.</p>
                ) : (
                    <div className="bg-white p-8 rounded-xl shadow-lg overflow-x-auto contact-form">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-4 text-gray-700 font-medium">Job ID</th>
                                    <th className="p-4 text-gray-700 font-medium">Name</th>
                                    <th className="p-4 text-gray-700 font-medium">Field of Study</th>
                                    <th className="p-4 text-gray-700 font-medium">Cover Letter</th>
                                    <th className="p-4 text-gray-700 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listOfApplicants.map((applicant) => (
                                    <React.Fragment key={applicant.id}>
                                        <tr className="border-b">
                                            <td className="p-4">{applicant.job.id}</td>
                                            <td className="p-4">{applicant.alumni_name}</td>
                                            <td className="p-4">{applicant.field_of_study}</td>
                                            <td className="p-4">{applicant.cover_letter}</td>
                                            <td className="p-4 flex space-x-2">
                                                <button
                                                    onClick={() => toggleRow(applicant.id)}
                                                    className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={expandedRows[applicant.id] ? faChevronUp : faChevronDown}
                                                        className="mr-1"
                                                    />
                                                    {expandedRows[applicant.id] ? 'View Less' : 'View More'}
                                                </button>
                                                {applicant.status === 'accepted' ? (
                                                    <button
                                                        disabled
                                                        className="px-3 py-1 bg-green-500 text-white rounded-lg opacity-50 cursor-not-allowed flex items-center"
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                                        Accepted
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusUpdate(applicant.id, 'accepted')}
                                                        disabled={applicant.status !== 'pending' || loading}
                                                        className={`px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                                        Accept                                                        
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleStatusUpdate(applicant.job.id, 'declined')}
                                                    disabled={applicant.status !== 'pending' || loading}
                                                    className={`px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} className="mr-1" />
                                                    Decline
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRows[applicant.id] && (
                                            <tr className="bg-gray-50 contact-form">
                                                <td colSpan="5" className="p-4">
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-800">Applicant Details</h3>
                                                        <p><strong>Applicant ID:</strong> {applicant.id}</p>
                                                        <p><strong>Alumni ID:</strong> {applicant.alumni_id}</p>
                                                        <p><strong>Alumni Name:</strong> {applicant.alumni_name}</p>
                                                        <p><strong>Field of Study:</strong> {applicant.field_of_study}</p>
                                                        <p><strong>Cover Letter:</strong> {applicant.cover_letter}</p>
                                                        {isMonthNotPast(applicant.created_on) && (
                                                            <p><strong>Applied On:</strong> {formatDate(applicant.created_on)}</p>
                                                        )}
                                                        <h3 className="text-lg font-semibold text-gray-800">Job Details</h3>
                                                        <p><strong>Job ID:</strong> {applicant.job.id}</p>
                                                        <p><strong>Title:</strong> {applicant.job.title}</p>
                                                        <p><strong>Description:</strong> {applicant.job.description}</p>
                                                        <p><strong>Field of Study:</strong> {applicant.job.field_of_study}</p>
                                                        {isMonthNotPast(applicant.job.created_on) && (
                                                            <p><strong>Created On:</strong> {formatDate(applicant.job.created_on)}</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobApplicantPage;