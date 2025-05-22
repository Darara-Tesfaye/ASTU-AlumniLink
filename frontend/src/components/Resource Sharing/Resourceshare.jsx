import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faLink, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from "react-router-dom";
import LoadingIndicator from "../LoadingIndicator";

const ResourceShareUpload = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        department: '',
        batch: '',
        course: '',
        resource_type: '',
        title: '',
        description: '',
        file: null,
        url: '',
    });
    const [loading, setLoading] = useState(false);
    const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
    const location = useLocation();
    const { user , profile }= location.state || {};
    const userId = user ? user.id : null;
    console.log("User", user);
    console.log("Profile", profile);


    const DEPARTMENT_CHOICES = [
        'Applied Biology Program', 'Applied Chemistry', 'Applied Physics', 'Applied Geology',
        'Applied Mathematics', 'Industrial Chemistry', 'Pharmacy Program', 'Computer Science and Engineering',
        'Electronics & Communication Engineering', 'Electrical Power and Control Engineering',
        'Software Engineering', 'Architecture', 'Civil Engineering', 'Water Resources Engineering',
        'Chemical Engineering', 'Material Science and Engineering', 'Mechanical Engineering'
    ];

    const RESOURCE_TYPE_CHOICES = ['text', 'book', 'ppt', 'file', 'url'];

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { department, batch, course, resource_type, title, file, url } = formData;

        if (!department || !batch || !course || !resource_type || !title) {
            toast.error("Please fill all required fields.", { position: "top-right" });
            return;
        }
        if (resource_type !== 'url' && !file) {
            toast.error("Please upload a file for this resource type.", { position: "top-right" });
            return;
        }
        if (resource_type === 'url' && !url) {
            toast.error("Please provide a URL for this resource type.", { position: "top-right" });
            return;
        }
        if(department !== profile.department){
            toast.error("You can only share resources in your own department.", { position: "top-right" });
            return; 
        }


        const formDataToSend = new FormData();
        formDataToSend.append('staff', userId);
        formDataToSend.append('department', department);
        formDataToSend.append('batch', batch);
        formDataToSend.append('course', course);
        formDataToSend.append('resource_type', resource_type);
        formDataToSend.append('title', title);
        if (formData.description) formDataToSend.append('description', formData.description);
        if (file) formDataToSend.append('file', file);
        if (url) formDataToSend.append('url', url);

        setLoading(true);
        try {
            console.log("[ResourceShareUpload] FormData Entries:", Array.from(formDataToSend.entries()));
            const response = await fetch(`${BASE_URL}/events/resource-share/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                },
                body: formDataToSend, 
            });
            console.log("[ResourceShareUpload] Response:", response);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log("[ResourceShareUpload] Error Details:", errorData);
                if (response.status === 401) {
                    toast.error("Unauthorized. Please log in.", { position: "top-right" });
                    navigate('/login');
                    throw new Error("Unauthorized");
                }
                throw new Error(`Failed to share resource: ${response.statusText}`);
            }
            const newResource = await response.json();
            console.log("[ResourceShareUpload] Created resource:", newResource);
            setFormData({
                department: '',
                batch: '',
                course: '',
                resource_type: '',
                title: '',
                description: '',
                file: null,
                url: '',
            });
            toast.success("Resource shared successfully!", { position: "top-right" });
        } catch (err) {
            toast.error("Error: " + err.message, { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-6 dark:bg-gray-900 regform_body">
            <ToastContainer />
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center dark_text">
                    Share a Resource
                </h1>
                <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-lg dark:bg-gray-800 contact-form">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 dark_text mb-2">Department <span className="text-red-500">*</span></label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Department</option>
                                {DEPARTMENT_CHOICES.map(dep => (
                                    <option key={dep} value={dep}>{dep}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 dark_text mb-2">Batch <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="batch"
                                value={formData.batch}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 2025"
                                required
                                minLength={4}
                                maxLength={4}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark_text mb-2">Course <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="course"
                                value={formData.course}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Data Structures"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark_text mb-2">Resource Type <span className="text-red-500">*</span></label>
                            <select
                                name="resource_type"
                                value={formData.resource_type}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Type</option>
                                {RESOURCE_TYPE_CHOICES.map(type => (
                                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 dark_text mb-2">Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Lecture Notes"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 dark_text mb-2">Description (Optional)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe the resource"
                                rows="4"
                            />
                        </div>
                        {formData.resource_type && formData.resource_type !== 'url' && (
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 dark_text mb-2">File Upload <span className="text-red-500">*</span></label>
                                <input
                                    type="file"
                                    name="file"
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}
                        {formData.resource_type === 'url' && (
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 dark_text mb-2">URL <span className="text-red-500">*</span></label>
                                <input
                                    type="url"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., https://example.com"
                                    required
                                />
                            </div>
                        )}
                    </div>
                    {loading && <LoadingIndicator />}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-white hover:to-white hover:text-blue-600 hover:border-blue-600 border'}`}
                    >
                        {loading ? (
                            <div className="flex items-center">
                                Sharing...
                            </div>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Share Resource
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResourceShareUpload;

