import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faIdBadge, faInfoCircle, faUserCircle, faUserTie } from '@fortawesome/free-solid-svg-icons';


const AlumniProfile = () => {
    const location = useLocation();
    const { user } = location.state || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false); //
    const BASE_URL = import.meta.env.VITE_users_API_URL;
    const email = user?.email;
    const [selectedFile, setSelectedFile] = useState(null);
    const [userData, setUserData] = useState({
        user: {
            email: user?.email || '',
            full_name: user?.full_name || '',
            usertype: user?.usertype || '',
            password: '',
            areas_of_interest: {
                mentoring: false,
                networking: false,
                events: false,
            },
        },
        id: user?.user_id,
        student_id: user?.student_id || '',
        qualification: user?.qualification || null,
        field_of_study: user?.field_of_study || null,
        graduated_year: user?.graduated_year || null,
        employment_status: user?.employment_status || null,
        company: user?.company || '',
        job_title: user?.job_title || '',
        professional_field: user?.professional_field || '',
        bio: user?.bio || '',
        profile_picture: user?.profile_picture || null,
        work_history: user?.work_history || [],
    });
    useEffect(() => {
        const fetchAlumniProfile = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/users/profile/?email=${encodeURIComponent(email)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch your Profile');
                }
                const data = await response.json();
                const parsedWorkHistory = typeof data.work_history === 'string'
                    ? JSON.parse(data.work_history)
                    : Array.isArray(data.work_history)
                        ? data.work_history
                        : [];


                setUserData((prevUserData) => ({
                    ...prevUserData,
                    user: {
                        email: data.user.email,
                        full_name: data.user.full_name,
                        usertype: data.user.usertype,
                        areas_of_interest: {
                            mentoring: data.user.areas_of_interest.mentoring || false,
                            networking: data.user.areas_of_interest.networking || false,
                            events: data.user.areas_of_interest.events || false,
                        },
                    },
                    id: data.user_id,
                    student_id: data.student_id || '',
                    qualification: data.qualification || '',
                    field_of_study: data.field_of_study || '',
                    graduated_year: data.graduated_year || null,
                    employment_status: data.employment_status || null,
                    company: data.company || '',
                    job_title: data.job_title || '',
                    professional_field: data.professional_field || '',
                    work_history: parsedWorkHistory,
                    bio: data.bio || '',
                    profile_picture: data.profile_picture || `${BASE_URL}/media/Profile_Picture/default.jpg`,
                }));


            } catch (err) {
                toast.error("Error fetching profile: " + err.message, { position: "top-right" });
            } finally {
                setLoading(false);
            }
        }
        if (email) {
            fetchAlumniProfile();
        } else {
            setError('No email provided.');
            setLoading(false);
        }
    }, [email]);

    console.log(userData);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            [name]: value,
        }));
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };


    const handleWorkHistoryChange = (index, e) => {
        const { name, value } = e.target;
        setUserData((prevUserData) => {
            const newWorkHistory = [...prevUserData.work_history];
            newWorkHistory[index] = { ...newWorkHistory[index], [name]: value };
            return { ...prevUserData, work_history: newWorkHistory };
        });
    };

    const addWorkHistory = () => {
        setUserData((prevUserData) => ({
            ...prevUserData,
            work_history: [...prevUserData.work_history, { position: '', company: '', start_year: '', finish_year: '' }],
        }));
    };

    const removeWorkHistory = (index) => {
        setUserData((prevUserData) => {
            const newWorkHistory = prevUserData.work_history.filter((_, i) => i !== index);
            return { ...prevUserData, work_history: newWorkHistory };
        });
    };

    const handleCheckboxChange = (event) => {

        const { name, checked } = event.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            user: {
                ...prevUserData.user,
                areas_of_interest: {
                    ...prevUserData.user.areas_of_interest,
                    [name]: checked,
                },
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const accessToken = localStorage.getItem(ACCESS_TOKEN);

        if (!accessToken) {
            toast.error("Access token is missing. Please try again.");
            return;
        }
        const workHistorySet = new Set();
        for (const entry of userData.work_history) {
            if (workHistorySet.has(entry.company + entry.position)) {
                toast.error("Duplicate work history entries are not allowed.", { position: "top-right" });
                return;
            }
            workHistorySet.add(entry.company + entry.position);
        }

        for (const entry of userData.work_history) {
            if (!entry.start_year) {
                toast.error("Start year cannot be empty.", { position: "top-right" });
                return;
            }
            if (entry.start_year < 1980) {
                toast.error("Start year must not be before 1980.", { position: "top-right" });
                return;
            }
            if (entry.start_year > entry.finish_year) {
                toast.error("Start year must not be after the finish year.", { position: "top-right" });
                return;
            }
        }

        if (userData.employment_status === "Unemployed" && (userData.company || userData.job_title)) {
            toast.error("Company and Job Title must be empty when unemployed.", { position: "top-right" });
            return;
        }
        const payload = {
            user: {
                email: userData.user.email,
                full_name: userData.user.full_name,
                usertype: userData.user.usertype,
                areas_of_interest: {
                    mentoring: userData.user.areas_of_interest.mentoring,
                    networking: userData.user.areas_of_interest.networking,
                    events: userData.user.areas_of_interest.events,
                },
            },
            student_id: userData.student_id,
            qualification: userData.qualification,
            field_of_study: userData.field_of_study,
            graduated_year: userData.graduated_year,
            employment_status: userData.employment_status,
            company: userData.company,
            job_title: userData.job_title,
            professional_field: userData.professional_field,
            bio: userData.bio,
            profile_picture: userData.profile_picture || null,
            work_history: userData.work_history.length > 0 ? userData.work_history : null,
        };



        try {

            const formData = new FormData();

            formData.append(
                'user',
                JSON.stringify({
                    email: userData.user.email || "",
                    full_name: userData.user.full_name || "",
                    usertype: userData.user.usertype || "",
                    password: userData.user.password || "",
                    areas_of_interest: userData.user.areas_of_interest || {
                        mentoring: userData.user.areas_of_interest.mentoring,
                        networking: userData.user.areas_of_interest.networking,
                        events: userData.user.areas_of_interest.events,
                    },
                })
            );
            formData.append('student_id', userData.student_id || "");
            formData.append('qualification', userData.qualification || null);
            formData.append('field_of_study', userData.field_of_study || null);
            formData.append('graduated_year', userData.graduated_year || null);
            formData.append('employment_status', userData.employment_status || null);
            formData.append('company', userData.company || "");
            formData.append('job_title', userData.job_title || "");
            formData.append('professional_field', userData.professional_field || "");
            formData.append('bio', userData.bio || "");


            if (selectedFile) {
                formData.append('profile_picture', selectedFile);
            }

            if (userData.work_history) {
                formData.append('work_history', JSON.stringify(userData.work_history));
            } else {
                formData.append('work_history', null);
            }


            const response = await fetch(`${BASE_URL}/users/alumni/profile/update/${userData.id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData
            });

        

            console.log("Fetch response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update profile: ${errorText}`);
            }

            const result = await response.json();
            toast.success("Profile updated successfully!", { position: "top-right" });
        } catch (error) {
            toast.error("Error updating profile: " + error.message, { position: "top-right" });
        }
    };
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <ToastContainer />
            <div className="bg-gray-50 alumni-profile ">
                <div className="grid lg:grid-cols-2 gap-6 grid-cols-1">
                    <div className=" grid lg:grid-rows-2 gap-4 grid-rows-1 ">
                        <div className="flex items-center justify-center flex-col bg-gray-100 p-6 flex-box-profile">
                            <h1 className="text-2xl font-bold mb-4">{userData.user.full_name}
                                <span className="text-lg border-l-4 border-orange-500 pl-1 ml-5">
                                    {userData.user.usertype}
                                </span>
                            </h1>
                            <div>
                                {userData.profile_picture && (
                                    <img
                                        src={userData.profile_picture || `${BASE_URL}/media/Profile_Picture/default.jpg`}
                                        alt="Profile"
                                        className="w-40 h-40 rounded-full border border-gray-300"
                                    />
                                )}
                            </div>
                            <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4 mt-10">
                                <span className="font-semibold">Bio:</span> {userData.bio || 'No bio available.'}
                            </p>
                        </div>

                        <div className="flex items-start justify-center flex-col bg-gray-50 p-6 rounded-lg shadow-md space-y-4 flex-box-profile">
                            <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                                <FontAwesomeIcon icon={faIdBadge} className="text-gray-500 mr-2 text-orange-500" />
                                <span className="font-semibold">User ID:</span> {userData.id || 'ID not available'}
                            </p>
                            <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                                <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-orange-500" />
                                {userData.user.email}
                            </p>

                            <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-orange-500" />
                                <span className="font-semibold mr-5">Student Id:</span> {userData.student_id}
                            </p>
                        </div>
                    </div>

                    <div className=" grid grid-rows-2 gap-4  ">
                        <div className="flex items-center justify-center flex-col bg-gray-100 p-6 flex-box-profile">
                            <div className="flex items-start justify-center flex-col bg-gray-100 p-6 rounded-lg  space-y-4 flex-box-profile">
                                <h1 className="text-2xl font-bold mb-4">Your Educational Status</h1>
                                <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                                    <span className="font-semibold mr-5">Qualification:</span> {userData.qualification || ' '}
                                </p>
                                <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                                    <span className="font-semibold mr-5">Dep't:</span> {userData.field_of_study}
                                </p>
                                <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                                    <span className="font-semibold mr-5">Professional Field:</span> {userData.professional_field}
                                </p>
                                <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                                    <span className="font-semibold mr-5">Graduate on:</span> {userData.graduated_year || 'No bio available.'}
                                </p>

                            </div>
                        </div>


                        <div className="flex items-start justify-center flex-col bg-gray-50 p-6 rounded-lg shadow-md space-y-4 flex-box-profile">
                            <h1 className="text-2xl font-bold mb-4">Employment status</h1>
                            <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                                <FontAwesomeIcon icon={faUserTie} className="text-gray-500 mr-2 text-orange-500" />
                                {userData.employment_status}
                                <p className="text-lg flex items-center border-l-2 border-orange-500 pl-4 ml-5">

                                    {userData.employment_status === 'Employed' ? (
                                        <span>
                                            {userData.job_title} at {userData.company}
                                        </span>
                                    ) : (
                                        userData.employment_status
                                    )}
                                </p>
                            </p>

                            <div>
                                <h3 className="text-lg font-semibold mt-2">Work History</h3>
                                <table className="min-w-full table-auto mt-4 border border-gray-300  overflow-x-auto">
                                    <thead>
                                        <tr className="bg-gray-200 flex-box-profile">
                                            <th className="border border-gray-300 px-4 py-2">Position</th>
                                            <th className="border border-gray-300 px-4 py-2">Company</th>
                                            <th className="border border-gray-300 px-4 py-2">Start Year</th>
                                            <th className="border border-gray-300 px-4 py-2">Finish Year</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userData.work_history.length > 0 ? (
                                            userData.work_history.map((entry, index) => (
                                                <tr key={index}>
                                                    <td className="border border-gray-300 px-4 py-2">{entry.position}</td>
                                                    <td className="border border-gray-300 px-4 py-2">{entry.company}</td>
                                                    <td className="border border-gray-300 px-4 py-2">{entry.start_year}</td>
                                                    <td className="border border-gray-300 px-4 py-2">{entry.finish_year || "Present"}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="border border-gray-300 px-4 py-2 text-center">
                                                    No work history available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="flex items-start justify-center flex-col bg-gray-50 p-6 rounded-lg shadow-md space-y-4 flex-box-profile">
                    <div className="bg-gray-100 p-4  flex-box-profile w-full">

                        {userData && (
                            <div>
                                <button
                                    className="mt-4 p-2 bg-blue-500 text-white rounded "
                                    onClick={handleEditToggle}
                                >
                                    {isEditing ? 'Cancel' : 'Edit Profile'}
                                </button>

                                {isEditing && (
                                    <form onSubmit={handleSubmit} className="mt-4 w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className="w-full mb-10 ">
                                                Bio:
                                                <textarea
                                                    name="bio"
                                                    value={userData.bio}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pr-5.75 flex items-center border border-gray-200 flex-box-profile rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500 flex-box-profile"
                                                />
                                            </label>


                                            <label className="w-full mb-10 ">
                                                Professional Field:
                                                <textarea
                                                    name="professional_field"
                                                    value={userData.professional_field}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pr-5.75 flex items-center border border-gray-200 flex-box-profile rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500 flex-box-profile"
                                                />
                                            </label>

                                        </div>
                                        <div>

                                            <label className="w-full  mb-10 ">
                                                Employment Status:
                                                <select
                                                    name="employment_status"
                                                    value={userData.employment_status}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pr-5.75 rounded-lg rounded border border-gray-200 pl-4 hover:border-blue-500 flex-box-profile focus:border-blue-500 "
                                                    required
                                                >
                                                    <option value="">Select Employment Status</option>
                                                    <option value="Unemployed">Unemployed</option>
                                                    <option value="Employed">Employed</option>
                                                </select>
                                            </label>
                                        </div>


                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <label className="w-full mb-10">
                                                Company:
                                                <input
                                                    type="text"
                                                    name="company"
                                                    value={userData.company || ''}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pr-5.75 flex items-center flex-box-profile border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"

                                                />
                                            </label>
                                            <label>
                                                Job Title:
                                                <input
                                                    type="text"
                                                    name="job_title"
                                                    value={userData.job_title || ''}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pr-5.75 flex items-center border border-gray-200 flex-box-profile rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"
                                                />
                                            </label>

                                        </div>
                                        <h3 className="text-lg font-semibold mt-2">Work History</h3>
                                        {(userData.work_history || []).map((entry, index) => (
                                            <div key={index} className="border p-2 mb-2 rounded">
                                                <label>
                                                    Position:
                                                    <input
                                                        type="text"
                                                        name="position"
                                                        value={entry.position || ''} // Ensure fallback to an empty string
                                                        onChange={(e) => handleWorkHistoryChange(index, e)}
                                                        className="border p-1 rounded w-full"
                                                    />
                                                </label>
                                                <label>
                                                    Company:
                                                    <input
                                                        type="text"
                                                        name="company"
                                                        value={entry.company || ''}
                                                        onChange={(e) => handleWorkHistoryChange(index, e)}
                                                        className="border p-1 rounded w-full"
                                                    />
                                                </label>
                                                <label>
                                                    Start Year:
                                                    <input
                                                        type="text"
                                                        name="start_year"
                                                        value={entry.start_year || ''} // Ensure fallback to an empty string
                                                        onChange={(e) => handleWorkHistoryChange(index, e)}
                                                        className="border p-1 rounded w-full"
                                                    />
                                                </label>
                                                <label>
                                                    Finish Year:
                                                    <input
                                                        type="text"
                                                        name="finish_year"
                                                        value={entry.finish_year || ''} // Ensure fallback to an empty string
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

                                        <h3 className="text-lg font-semibold mt-2">Areas of Interest</h3>

                                        <div className="w-full relative col-span-1">
                                            <label className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                                Areas of Interest
                                            </label>
                                            <div className="flex flex-col items-center border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="mentoring"
                                                        checked={userData.user.areas_of_interest.mentoring || false}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    Mentoring
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="networking"
                                                        checked={userData.user.areas_of_interest.networking || false}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    Networking
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="events"
                                                        checked={userData.user.areas_of_interest.events || false}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    Events
                                                </label>
                                            </div>
                                        </div>

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
                        )
                        }
                    </div>
                </div>
            </div>
        </div>

    );

};
export default AlumniProfile;