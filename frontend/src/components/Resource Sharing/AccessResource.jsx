import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faLink, faDownload, faExternalLinkAlt, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import Fuse from 'fuse.js';
import LoadingIndicator from "../LoadingIndicator";

const AccessResources = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile } = location.state || {};
    const [resources, setResources] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/events/access-resource-share/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || "Failed to fetch resources");
                }
                const data = await response.json();
                setResources(data);
            } catch (err) {
                toast.error(`Error: ${err.message}`, { position: "top-right" });
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [navigate, profile]);
    console.log("Resources", resources);
    const fuse = useMemo(() => {
        return new Fuse(resources, {
            keys: ['course'],
            threshold: 0.4,
            includeScore: true,
            minMatchCharLength: 1,
        });
    }, [resources]);

    const filteredResources = useMemo(() => {
        if (!searchTerm.trim()) {
            return resources;
        }
        const results = fuse.search(searchTerm.trim());
        return results.map(result => result.item);
    }, [searchTerm, fuse, resources]);

    const handleResourceAction = (resource) => {
        if (resource.resource_type === 'url') {
            window.open(resource.url, '_blank', 'noopener,noreferrer');
        } else {
            const fileUrl = resource.file.startsWith('http') ? resource.file : `${BASE_URL}${resource.file}`;
            window.location.href = fileUrl;
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="bg-gray-100 min-h-screen p-6 dark:bg-gray-900 regform_body">
            <ToastContainer />
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center dark_text">
                    Access Resources
                </h1>
                <div className="mb-8 flex justify-center">
                    <div className="relative w-full max-w-lg">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search by course name (e.g., Algorithms)"
                            className="w-full pl-10 pr-10 py-2 border rounded-lg bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        )}
                    </div>
                </div>
                {loading && <LoadingIndicator />}
                {error && (
                    <div className="text-center text-red-500 dark:text-red-400 mb-6">
                        {error}
                    </div>
                )}
                {!loading && !error && resources.length === 0 && (
                    <div className="text-center text-gray-600 dark:text-gray-400 mb-6">
                        No resources available in your department.
                    </div>
                )}
                {!loading && !error && resources.length > 0 && filteredResources.length === 0 && (
                    <div className="text-center text-gray-600 dark:text-gray-400 mb-6">
                        No resources match your search.
                    </div>
                )}
                {!loading && !error && filteredResources.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredResources.map(resource => (
                            <div
                                key={resource.id}
                                className="p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800 flex flex-col contact-form"
                            >
                                <div className="flex items-center mb-4">
                                    <FontAwesomeIcon
                                        icon={resource.resource_type === 'url' ? faLink : faFile}
                                        className="text-orange-500 mr-3 text-xl"
                                    />
                                    <h2 className="text-xl font-semibold text-gray-800 dark_text">
                                        {resource.title}
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-2">
                                    {resource.description || 'No description provided.'}
                                </p>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <p><strong>Course:</strong> {resource.course}</p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        <span className="font-semibold">Shared by:</span>{' '}
                                        <button
                                            onClick={() =>
                                                navigate(`/profile/${resource.StaffProfile.user.id}`, {
                                                    state: {
                                                        user: {
                                                            user_id: resource.StaffProfile.user.id,
                                                            full_name: resource.StaffProfile.user.full_name,
                                                            email: resource.StaffProfile.user.email,
                                                            usertype: resource.StaffProfile.user.usertype || 'staff',
                                                        },
                                                        profile: resource.StaffProfile || {},
                                                        currentUser: user,
                                                    },
                                                })
                                            }
                                            className="text-blue-500 hover:underline"
                                            aria-label={`View profile of ${resource.StaffProfile.user.full_name}`}
                                        >
                                            {resource.StaffProfile.user.full_name}
                                        </button>
                                    </p>
                                    <p><strong>Type:</strong> {resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}</p>
                                    <p><strong>Shared On:</strong> {new Date(resource.created_on).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => handleResourceAction(resource)}
                                    className="mt-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:from-white hover:to-white hover:text-blue-600 hover:border-blue-600 border flex items-center justify-center"
                                >
                                    <FontAwesomeIcon
                                        icon={resource.resource_type === 'url' ? faExternalLinkAlt : faDownload}
                                        className="mr-2"
                                    />
                                    {resource.resource_type === 'url' ? 'Open Link' : 'Download File'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccessResources;