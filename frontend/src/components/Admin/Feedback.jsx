import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FeedbackList = () => {
    const location = useLocation();
    const { user, profile } = location.state || {};
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const BASE_URL = import.meta.env.VITE_users_API_URL;
    const [feedbacks, setFeedbacks] = React.useState([]);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await fetch(`${BASE_URL}/contactapp/feedback-list/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                });
                
                const data = await response.json();
                const sortedFeedbacks = data.sort((a, b) => 
                    new Date(b.created_on) - new Date(a.created_on)
                );
                setFeedbacks(sortedFeedbacks);
            } catch (error) {
                console.error("Error fetching feedbacks:", error);
            }
        };

        fetchFeedback();
    }, [accessToken, BASE_URL]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            try {
                const response = await fetch(`${BASE_URL}/contactapp/delete-feedback/${id}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                });

                if (response.ok) {
                    setFeedbacks(feedbacks.filter(feedback => feedback.id !== id));
                    toast.success("Feedback deleted successfully.");
                } else {
                    const errorData = await response.json();
                    toast.error(`Failed to delete feedback: ${errorData.error}`);
                }
            } catch (error) {
                toast.error("Error deleting feedback.");
                console.error("Error:", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 admin-board w-4/4">
            <ToastContainer />
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 contact-form">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 dark_text">Admin Feedback Dashboard</h1>
                {feedbacks.length === 0 ? (
                    <p className="text-gray-500">No feedback available.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-200 text-gray-700 admin-board">
                                    <th className="px-4 py-2 text-left">Name</th>
                                    <th className="px-4 py-2 text-left">Email</th>
                                    <th className="px-4 py-2 text-left">Subject</th>
                                    <th className="px-4 py-2 text-left">Message</th>
                                    <th className="px-4 py-2 text-left">Date</th>
                                    <th className="px-4 py-2 text-left">Affiliation</th>
                                    <th className="px-4 py-2 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbacks.map(feedback => (
                                    <tr key={feedback.id} className="border-b">
                                        <td className="px-4 py-2">{feedback.name}</td>
                                        <td className="px-4 py-2">{feedback.email}</td>
                                        <td className="px-4 py-2">{feedback.subject}</td>
                                        <td className="px-4 py-2">{feedback.message}</td>
                                        <td className="px-4 py-2">
                                            {new Date(feedback.created_on).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2">{feedback.affiliation}</td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleDelete(feedback.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackList;