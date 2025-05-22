import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faUser, faPhone, faGraduationCap, faBriefcase, faTools } from '@fortawesome/free-solid-svg-icons';

const ApplyInternship = () => {
    const navigate = useNavigate();
    const { id: internshipId } = useParams();
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
            setFetchLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/users/student/profile/?email=${encodeURIComponent(email)}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                const data = await response.json();
                setProfile(data);
            } catch (err) {                
                    toast.err('Failed to load profile. Please try again.');
                }
             finally {
                setFetchLoading(false);
            }
        };
        fetchProfile();
    }, [BASE_URL, email, navigate]);

    const userData = {
        student_id: profile?.student_id || '',
        student_name: profile?.user?.full_name || '',
        department: profile?.department || '',
        phone_number: profile?.phone_number || '',
        achievements: profile?.achievements || '',
        professional_experiences: profile?.professional_experiences || '',
        skills: profile?.skills || '',
    };
       const handleSubmit = async (e) => {
        e.preventDefault();
        if (!coverLetter.trim()) {
            toast.error("Interest letter is required.", { position: "top-right" });
            return;
        }
       
        const applicationData = {
            ...userData,
            cover_letter: coverLetter,
            internship: internshipId,
        };
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/events/apply-internship/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(applicationData),
            });
          
            if(!response.ok){
                toast.error("You have already applied for this internship.");
            }        
            const result = await response.json();
            toast.success("Application submitted successfully!", { position: "top-right" });
        } catch (err) {           
            console.log('Failed to submit application.');
        } finally {
            setLoading(false);
        }
    };

 if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }



    return (
        <div className="bg-gray-100 min-h-screen p-6 dark:bg-gray-900">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Apply for Internship
                </h1>
                {error && (
                    <p className="text-red-500 text-center text-xl mb-6">{error}</p>
                )}
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="block">
                                <label className="text-gray-700 font-medium flex items-center">
                                    <FontAwesomeIcon icon={faUser} className="mr-2 text-orange-500" />
                                    Student Name
                                </label>
                                <input
                                    type="text"
                                    value={userData.student_name}
                                    readOnly
                                    className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div className="block">
                                <label className="text-gray-700 font-medium flex items-center">
                                    <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-orange-500" />
                                    Department
                                </label>
                                <input
                                    type="text"
                                    value={userData.department}
                                    readOnly
                                    className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div className="block">
                                <label className="text-gray-700 font-medium flex items-center">
                                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-orange-500" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={userData.phone_number}
                                    readOnly
                                    className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div className="block">
                                <label className="text-gray-700 font-medium flex items-center">
                                    <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-orange-500" />
                                    Achievements
                                </label>
                                <input
                                    type="text"
                                    value={userData.achievements}
                                    readOnly
                                    className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div className="block">
                                <label className="text-gray-700 font-medium flex items-center">
                                    <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-orange-500" />
                                    Professional Experiences
                                </label>
                                <input
                                    type="text"
                                    value={userData.professional_experiences}
                                    readOnly
                                    className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div className="block">
                                <label className="text-gray-700 font-medium flex items-center">
                                    <FontAwesomeIcon icon={faTools} className="mr-2 text-orange-500" />
                                    Skills
                                </label>
                                <input
                                    type="text"
                                    value={userData.skills}
                                    readOnly
                                    className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="block">
                            <label className="text-gray-700 font-medium flex items-center">
                                <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-orange-500" />
                                Interest Letter (Cover Letter)
                            </label>
                            <textarea
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                className="mt-1 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                rows="6"
                                placeholder="Write your interest letter here..."
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

export default ApplyInternship;