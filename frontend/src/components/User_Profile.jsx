import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Profile = () => {
    const location = useLocation();
    const { user } = location.state || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
    const BASE_URL = import.meta.env.VITE_users_API_URL;
    const email = user?.email; // Use optional chaining to avoid errors

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/users/profile/?email=${encodeURIComponent(email)}`);                
                if (!response.ok) {
                    throw new Error('Failed to fetch Profile');
                }
                const data = await response.json(); // Parse the JSON response
                setUserData(data); // Set the user data
            } catch (err) {
                setError('Failed to fetch user profile.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (email) {
            fetchUserProfile(); // Only fetch if email is available
        } else {
            setError('No email provided.');
            setLoading(false);
        }
    }, [email]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUserData({ ...userData, photo: file });
    };

    const handleWorkHistoryChange = (index, e) => {
        const { name, value } = e.target;
        const newWorkHistory = [...userData.alumni_profile.work_history];
        newWorkHistory[index] = { ...newWorkHistory[index], [name]: value };
        setUserData({ ...userData, alumni_profile: { ...userData.alumni_profile, work_history: newWorkHistory } });
    };

    const addWorkHistory = () => {
        const newEntry = { position: '', company: '', start_year: '', finish_year: '' };
        setUserData({ ...userData, alumni_profile: { ...userData.alumni_profile, work_history: [...(userData.alumni_profile.work_history || []), newEntry] } });
    };

    const removeWorkHistory = (index) => {
        const newWorkHistory = userData.alumni_profile.work_history.filter((_, i) => i !== index);
        setUserData({ ...userData, alumni_profile: { ...userData.alumni_profile, work_history: newWorkHistory } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            // Append all updated fields
            for (const key in userData) {
                if (key === "alumni_profile") {
                    for (const profileKey in userData.alumni_profile) {
                        formData.append(`alumni_profile[${profileKey}]`, userData.alumni_profile[profileKey]);
                    }
                } else {
                    formData.append(key, userData[key]);
                }
            }

            const response = await fetch(`${BASE_URL}/users/profile/update/`, {
                method: 'PUT',
                body: formData, // Use FormData for file uploads
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedData = await response.json();
            setUserData(updatedData); // Update state with new user data
            setIsEditing(false); // Exit edit mode
        } catch (err) {
            setError('Failed to update user profile.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            {userData && (
                <div>
                    <p><strong>Name:</strong> {userData.full_name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>User Type:</strong> {userData.usertype}</p>

                    {/* Displaying different profiles based on user type */}
                    {userData.alumni_profile && (
                        <div>
                            <h2 className="text-xl font-semibold mt-4">Alumni Profile</h2>
                            <p><strong>Bio:</strong> {userData.alumni_profile.bio}</p>
                            <p><strong>Employment Status:</strong> {userData.alumni_profile.employment_status}</p>
                            <p><strong>Company:</strong> {userData.alumni_profile.company}</p>
                            <p><strong>Job Title:</strong> {userData.alumni_profile.job_title}</p>
                            <h3 className="text-lg font-semibold mt-2">Work History</h3>
                    
                        </div>
                    )}

                    {/* Edit Button */}
                    <button 
                        className="mt-4 p-2 bg-blue-500 text-white rounded"
                        onClick={handleEditToggle}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>

                    {/* Update Form */}
                    {isEditing && (
                        <form onSubmit={handleSubmit} className="mt-4">
                            <div>
                                <label>
                                    Bio:
                                    <textarea
                                        name="bio"
                                        value={userData.alumni_profile.bio || ''}
                                        onChange={handleChange}
                                        className="border p-2 rounded w-full"
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Employment Status:
                                    <input
                                        type="text"
                                        name="employment_status"
                                        value={userData.alumni_profile.employment_status || ''}
                                        onChange={handleChange}
                                        className="border p-2 rounded w-full"
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Company:
                                    <input
                                        type="text"
                                        name="company"
                                        value={userData.alumni_profile.company || ''}
                                        onChange={handleChange}
                                        className="border p-2 rounded w-full"
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Job Title:
                                    <input
                                        type="text"
                                        name="job_title"
                                        value={userData.alumni_profile.job_title || ''}
                                        onChange={handleChange}
                                        className="border p-2 rounded w-full"
                                    />
                                </label>
                            </div>
                            <h3 className="text-lg font-semibold mt-2">Work History</h3>
                            {(userData.alumni_profile.work_history || []).map((entry, index) => (
                                <div key={index} className="border p-2 mb-2 rounded">
                                    <label>
                                        Position:
                                        <input
                                            type="text"
                                            name="position"
                                            value={entry.position}
                                            onChange={(e) => handleWorkHistoryChange(index, e)}
                                            className="border p-1 rounded w-full"
                                        />
                                    </label>
                                    <label>
                                        Company:
                                        <input
                                            type="text"
                                            name="company"
                                            value={entry.company}
                                            onChange={(e) => handleWorkHistoryChange(index, e)}
                                            className="border p-1 rounded w-full"
                                        />
                                    </label>
                                    <label>
                                        Start Year:
                                        <input
                                            type="text"
                                            name="start_year"
                                            value={entry.start_year}
                                            onChange={(e) => handleWorkHistoryChange(index, e)}
                                            className="border p-1 rounded w-full"
                                        />
                                    </label>
                                    <label>
                                        Finish Year:
                                        <input
                                            type="text"
                                            name="finish_year"
                                            value={entry.finish_year}
                                            onChange={(e) => handleWorkHistoryChange(index, e)}
                                            className="border p-1 rounded w-full"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => removeWorkHistory(index)}
                                        className="mt-2 p-1 bg-red-500 text-white rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addWorkHistory}
                                className="mt-2 p-2 bg-blue-500 text-white rounded"
                            >
                                Add Work History
                            </button>

                            <div>
                                <label>
                                    Profile Photo:
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="border p-2 rounded w-full"
                                    />
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                className="mt-4 p-2 bg-green-500 text-white rounded"
                            >
                                Update Profile
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;