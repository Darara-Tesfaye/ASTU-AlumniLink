import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ACCESS_TOKEN } from "../../constants";
import LoadingIndicator from "../LoadingIndicator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCheck, faTimes, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const ApplicantPage = () => {
    const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
    const [listOfApplicants, setListOfApplicants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});

    useEffect(() => {
        fetchListOfInternApplicants();
    }, []);

    const fetchListOfInternApplicants = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/events/internship-applicant/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch applicants.");     
            }
            const data = await response.json();
            setListOfApplicants(data);
        } catch (error) {
            toast.error(error.message, { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicantId, newStatus) => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/events/internship-applications/${applicantId}/status/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                throw new Error(`Failed to update status to ${newStatus}.`);
            }
            const updatedApplicant = await response.json();
            setListOfApplicants((prev) =>
                prev.map((applicant) =>
                    applicant.id === applicantId ? { ...applicant, status: newStatus } : applicant
                )
            );
            toast.success(`Application ${newStatus} successfully!`, { position: "top-right" });
        } catch (error) {
            toast.error(error.message, { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const parseJSONField = (field) => {
        try {
            return JSON.parse(field);
        } catch {
            return [];
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
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
console.log(listOfApplicants);
    return (
        <div className="bg-gray-100 min-h-screen p-6 dark:bg-gray-900 regform_body">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center dark_text">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-orange-500" />
                    Internship Applicants
                </h1>
                {listOfApplicants.length === 0 ? (
                    <p className="text-gray-600 text-center text-xl">No applicants found.</p>
                ) : (
                    <div className="bg-white p-8 rounded-xl shadow-lg overflow-x-auto contact-form">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-4 text-gray-700 font-medium">Internship ID</th>
                                    <th className="p-4 text-gray-700 font-medium">Name</th>
                                    <th className="p-4 text-gray-700 font-medium">Department</th>
                                    <th className="p-4 text-gray-700 font-medium">Cover Letter</th>
                                    <th className="p-4 text-gray-700 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listOfApplicants.map((applicant) => (
                                    <React.Fragment key={applicant.id}>
                                        <tr className="border-b ">
                                            
                                            <td className="p-4">{applicant.internship}</td>
                                            <td className="p-4">{applicant.student_name}</td>
                                            <td className="p-4">{applicant.department}</td>
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
                                                    onClick={() => handleStatusUpdate(applicant.id, 'declined')}
                                                    disabled={applicant.status !== 'pending' || loading}
                                                    className={`px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} className="mr-1" />
                                                    Decline
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRows[applicant.id] && applicant && (
                                            <tr className="bg-gray-50 contact-form">
                                                <td colSpan="5" className="p-4">
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-800">Applicant Details</h3>
                                                        <p><strong>Student ID:</strong> {applicant.student_id}</p>
                                                        <p><strong>Phone:</strong> {applicant.phone_number}</p>
                                                        <p><strong>Achievements:</strong></p>
                                                        {parseJSONField(applicant.achievements).length > 0 ? (
                                                            parseJSONField(applicant.achievements).map((ach, idx) => (
                                                                <div key={idx} className="ml-4">
                                                                    <strong>{ach.title}</strong>: {ach.description} ({ach.date_earned})
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="ml-4">None</p>
                                                        )}
                                                        <p><strong>Experience:</strong></p>
                                                        {parseJSONField(applicant.professional_experiences).length > 0 ? (
                                                            parseJSONField(applicant.professional_experiences).map((exp, idx) => (
                                                                <div key={idx} className="ml-4">
                                                                    <strong>{exp.company_name}</strong> - {exp.position}: {exp.description}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="ml-4">None</p>
                                                        )}
                                                        <p><strong>Skills:</strong></p>
                                                        {parseJSONField(applicant.skills).length > 0 ? (
                                                            parseJSONField(applicant.skills).map((skill, idx) => (
                                                                <div key={idx} className="ml-4">
                                                                    {skill.name} ({skill.level})
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="ml-4">None</p>
                                                        )}
                                                        <p><strong>Applied On:</strong> {formatDate(applicant.created_on)}</p>
                                                        <h3 className="text-lg font-semibold text-gray-800">Internship Details</h3>
                                                        <p><strong>Title:</strong> {applicant.internships.title}</p>
                                                        <p><strong>Description:</strong> {applicant.internships.description}</p>
                                                        <p><strong>Departments:</strong> {applicant.internships.departments}</p>
                                                        <p><strong>Batch:</strong> {applicant.internships.batch}</p>
                                                        <p><strong>Area:</strong> {applicant.internships.area}</p>
                                                        <p><strong>Start Date:</strong> {formatDate(applicant.internships.start_date)}</p>
                                                        <p><strong>End Date:</strong> {formatDate(applicant.internships.end_date)}</p>
                                                        <p><strong>Created On:</strong> {formatDate(applicant.internships.created_on)}</p>
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

export default ApplicantPage;