import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faUser, faGraduationCap, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import LoadingIndicator from "../LoadingIndicator";
const ApplyJob = () => {
    const navigate = useNavigate();
    const { id: jobId } = useParams();
    const location = useLocation();
    const { user } = location.state || {};
    const email = user?.email;
    const [profile, setProfile] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchProfile = async () => {
            if (!email) {
                toast.error("Please log in to apply.", { position: "top-right" });
                setFetchLoading(false);
                return;
            }
            setFetchLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/users/profile/?email=${encodeURIComponent(email)}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    },
                });
                const data = await response.json();              
                setProfile(data);
            } catch (err) {                               
                    toast.error("Error fetching profile: " + err.message, { position: "top-right" });
            }
             finally {
                setFetchLoading(false);
            }
        };
        fetchProfile();
    }, [BASE_URL, email, navigate]);

    const userData = {
        alumni_id: profile?.student_id || '',
        alumni_name: profile?.user?.full_name || '',
        field_of_study: profile?.field_of_study || '',
    };
    console.log("userData:", userData);

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
        toast.error("Cover letter is required.", { position: "top-right" });
        return;
    }
    const applicationData = {
        job: jobId,
        alumni_id: userData.alumni_id,
        alumni_name: userData.alumni_name,
        field_of_study: userData.field_of_study,
        cover_letter: coverLetter,
    };

    setLoading(true);
    try {
        const response = await fetch(`${BASE_URL}/events/job-applications/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(applicationData),
        });

        if (!response.ok) {
            toast.err("Failed to submit application:");
            } 
        await response.json();
        toast.success("Application submitted successfully!", { position: "top-right" });

    } catch (err) {
        toast.error('You have already applied for this job.');
    } finally {
        setLoading(false);
    }

    };
{loading && <LoadingIndicator />}

    return (
        <div className="bg-gray-100 min-h-screen p-6 dark:bg-gray-900">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Apply for Job
                </h1>
                {error && (
                    <p className="text-red-500 text-center text-xl mb-6">{error}</p>
                )}
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="block">
                            <label className="text-gray-700 font-medium flex items-center">
                                <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-orange-500" />
                                Job ID
                            </label>
                            <input
                                type="text"
                                value={jobId}
                                readOnly
                                className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div className="block">
                            <label className="text-gray-700 font-medium flex items-center">
                                <FontAwesomeIcon icon={faUser} className="mr-2 text-orange-500" />
                                Alumni ID
                            </label>
                            <input
                                type="text"
                                value={userData.alumni_id}
                                readOnly
                                className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div className="block">
                            <label className="text-gray-700 font-medium flex items-center">
                                <FontAwesomeIcon icon={faUser} className="mr-2 text-orange-500" />
                                Alumni Name
                            </label>
                            <input
                                type="text"
                                value={userData.alumni_name}
                                readOnly
                                className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div className="block">
                            <label className="text-gray-700 font-medium flex items-center">
                                <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-orange-500" />
                                Field of Study
                            </label>
                            <input
                                type="text"
                                value={userData.field_of_study}
                                readOnly
                                className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div className="block">
                            <label className="text-gray-700 font-medium flex items-center">
                                <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-orange-500" />
                                Cover Letter
                            </label>
                            <textarea
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                className="mt-1 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                rows="6"
                                placeholder="Write your cover letter here..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || fetchLoading}
                            className={`w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-white hover:to-white hover:text-blue-600 hover:border-blue-600 border transition-all duration-300 transform hover:scale-105 ${(loading || fetchLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                                    Submitting...
                                </div>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApplyJob;
