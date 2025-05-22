import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faBuilding, faPhone, faUser, faGlobe, faMapPin, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

const CompanyProfile = () => {
    const location = useLocation();
    const { user } = location.state || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
    const email = user?.email;
    const accessToken = localStorage.getItem(ACCESS_TOKEN)
    const [errors, setErrors] = useState({ contact_person_phone_number: '' });

    const [companyData, setCompanyData] = useState({
        user: {
            email: 'backos@gmail.com',
            full_name: 'Backos Technology',
            usertype: '',
            password: '',
            areas_of_interest: null,
        },
        user_id: '77',
        company_name: 'Getaneh',
        company_address: 'Mebrathayl',
        company_city: 'Adama',
        postal_code: null,
        company_country: 'Ethiopia',
        website_url: '',
        contact_person_phone_number: '1111111',
        profile_picture: `${BASE_URL}/media/Profile_Picture/default.jpg`,
    });

    useEffect(() => {
        const fetchCompanyProfile = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/users/company/profile/?email=${encodeURIComponent(email)}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch company profile');
                }
                const data = await response.json();
                console.log("Fetched data:", data);
                setCompanyData({
                    user: {
                        email: data.user.email || '',
                        full_name: data.user.full_name || '',
                        usertype: data.user.usertype || '',
                        areas_of_interest: data.user.areas_of_interest || null,
                    },
                    user_id: data.user_id || data.user.id || '',
                    company_name: data.company_name || '',
                    company_address: data.company_address || '',
                    company_city: data.company_city || '',
                    postal_code: data.postal_code || null,
                    company_country: data.company_country || '',
                    website_url: data.website_url || '',
                    contact_person_phone_number: data.contact_person_phone_number || '',
                    profile_picture: data.profile_picture
                        ? (data.profile_picture.startsWith('http://') || data.profile_picture.startsWith('https://')
                            ? data.profile_picture
                            : `${BASE_URL}${data.profile_picture}`)
                        : `${BASE_URL}/media/Profile_Picture/default.jpg`,
                });
            } catch (err) {
                toast.error("Error fetching profile: " + err.message, { position: "top-right" });
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        if (email) {
            fetchCompanyProfile();
        } else {
            setError('No email provided.');
            setLoading(false);
        }
    }, [email, BASE_URL]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (isEditing) {
            setSelectedFile(null);
            setPreviewImage(null);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCompanyData((prev) => ({
            ...prev,
            [name]: value || '',
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleUpdateClick = () => {
        toast.info(
            <div className="flex items-center">
                <span className="mr-3">Do you want to update?</span>
                <button
                    onClick={() => handleSubmit()}
                    className="px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 mr-2"
                >
                    Yes <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                    onClick={() => toast.dismiss()}
                    className="px-2 py-1 bg-red-100 text-red-500 rounded hover:bg-red-200"
                >
                    No <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>,
            {
                position: "top-right",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                toastId: "confirm-toast",
                className: "max-w-md",
            }
        );
    };

    const validatePhoneNumber = (value) => {
        if (!value) return '';

        const digits = value.replace(/\D/g, '');
        const startsWithPlus = value.startsWith('+');

        const validChars = new Set(digits + (startsWithPlus ? '+' : ''));
        if (new Set(value).size > validChars.size) {
            return 'Phone number can only contain digits and an optional leading "+".';
        }

        if (!digits.startsWith('09') && !digits.startsWith('07') && !(startsWithPlus && value.startsWith('+251'))) {
            return 'Use Ethiopia country code for phone number.';
        }

        const digitCount = digits.length;
        if (value.startsWith('+251')) {
            if (digitCount !== 12) {
                return 'Phone number with "+251" must have exactly 13 digits.';
            }
        } else if (digits.startsWith('09') || digits.startsWith('07')) {
            if (digitCount !== 10) {
                return 'Phone number  must have exactly 10 digits.';
            }
        }

        if (value.length > 15) {
            return 'Phone number cannot exceed 15 characters.';
        }

        return '';
    };

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        if (!companyData.company_name) {
            toast.error("Company Name is required.", { position: "top-right" });
            return;
        }
     
        const phoneError = validatePhoneNumber(companyData.contact_person_phone_number);
        if (phoneError) {
            setErrors({ ...errors, contact_person_phone_number: phoneError });
            toast.error(phoneError);
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append(
            'user',
            JSON.stringify({
                email: companyData.user.email,
                full_name: companyData.user.full_name,
                usertype: companyData.user.usertype,
                areas_of_interest: companyData.user.areas_of_interest,
            })
        );
        formData.append('company_name', companyData.company_name || '');
        formData.append('company_address', companyData.company_address || '');
        formData.append('company_city', companyData.company_city || '');
        formData.append('postal_code', companyData.postal_code || '');
        formData.append('company_country', companyData.company_country || '');
        formData.append('contact_person_phone_number', companyData.contact_person_phone_number || '');
        formData.append('website_url', companyData.website_url || '');
        if (selectedFile) {
            formData.append('profile_picture', selectedFile);
        }


        try {
            const response = await fetch(`${BASE_URL}/users/company/profile/update/${companyData.user_id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.json();
                throw new Error(`Failed to update profile: ${JSON.stringify(errorText)}`);
            }

            const result = await response.json();
            console.log("Update Response:", result);
            toast.success("Profile updated successfully!", { position: "top-right" });
            setIsEditing(false);
            setSelectedFile(null);
            setPreviewImage(null);
            const updatedResponse = await fetch(`${BASE_URL}/users/company/profile/?email=${encodeURIComponent(companyData.user.email)}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (updatedResponse.ok) {
                const updatedData = await updatedResponse.json();
                setCompanyData({
                    user: {
                        email: updatedData.user.email || '',
                        full_name: updatedData.user.full_name || '',
                        usertype: updatedData.user.usertype || '',
                        areas_of_interest: updatedData.user.areas_of_interest || null,
                    },
                    user_id: updatedData.user_id || updatedData.user.id || '',
                    company_name: updatedData.company_name || '',
                    company_address: updatedData.company_address || '',
                    company_city: updatedData.company_city || '',
                    postal_code: updatedData.postal_code || null,
                    company_country: updatedData.company_country || '',
                    website_url: updatedData.website_url || '',
                    contact_person_phone_number: updatedData.contact_person_phone_number || '',
                    profile_picture: updatedData.profile_picture
                        ? (updatedData.profile_picture.startsWith('http://') || updatedData.profile_picture.startsWith('https://')
                            ? updatedData.profile_picture
                            : `${BASE_URL}${updatedData.profile_picture}`)
                        : `${BASE_URL}/media/Profile_Picture/default.jpg`,
                });
            }
        } catch (error) {
            toast.error("Error updating profile: " + error.message, { position: "top-right" });
            console.error("Update error:", error);
        }
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

    return (
        <div className="bg-gray-100 min-h-screen p-6 regform_body">
            <ToastContainer />
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 contact-form">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 dark_text">Company Profile</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col items-center">
                        <img
                            src={previewImage || companyData.profile_picture}
                            alt="Company Profile"
                            className="w-48 h-48 rounded-full border-4 border-orange-100 object-cover shadow-md"
                        />


                        <h2 className="text-2xl font-semibold text-gray-800 dark_text">{companyData.user.full_name}</h2>
                        <p className="text-gray-500 flex items-center mt-2">
                            <FontAwesomeIcon icon={faBuilding} className="text-orange-500 mr-2" />
                            {companyData.company_address}, {companyData.company_city}, {companyData.company_country}
                        </p>
                        {companyData.postal_code && (
                        <p className="text-lg text-gray-500 flex items-center">
                            <FontAwesomeIcon icon={faMapPin} className="mr-2 text-orange-500" />
                            Postal Code: {companyData.postal_code}
                        </p>
                    )}

                      
                    </div>

                    <div className="space-y-4">
                        <p className="text-lg flex items-center text-gray-500">
                            <FontAwesomeIcon icon={faEnvelope} className="text-orange-500 mr-2" />
                            <span className="font-medium">Email:</span> {companyData.user.email}
                        </p>
                        <p className="text-lg flex items-center text-gray-500">
                            <FontAwesomeIcon icon={faUser} className="text-orange-500 mr-2" />
                            <span className="font-medium">Contact Person:   </span>{companyData.company_name}
                        </p>
                        <p className="text-lg flex items-center text-gray-500">
                            <FontAwesomeIcon icon={faPhone} className="text-orange-500 mr-2" />
                            <span className="font-medium">Contact Person Phone:</span> {companyData.contact_person_phone_number}
                        </p>
                        <p className="text-lg flex items-center text-gray-500">
                            <FontAwesomeIcon icon={faGlobe} className="text-orange-500 mr-2" />
                            <span className="font-medium">Website:</span> {companyData.website_url || 'Not provided'}
                        </p>
                    </div>
                    </div>
                    <div className="mt-8 text-center">
                    <button
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                        onClick={handleEditToggle}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                {isEditing && (
                    <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="block">
                                <span className="text-gray-700 font-medium">Contact Person Name</span>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={companyData.company_name}
                                    onChange={handleChange}
                                    className="mt-1 w-full p-3 bg-transparent border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    required
                                    placeholder="Enter company name"
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700 font-medium">Contact Phone Number</span>
                                <input
                                    type="tel"
                                    name="contact_person_phone_number"
                                    value={companyData.contact_person_phone_number}
                                    onChange={handleChange}
                                    className="mt-1 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-transparent"
                                    required
                                    placeholder="Enter phone number"
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700 font-medium">Website URL</span>
                                <input
                                    type="url"
                                    name="website_url"
                                    value={companyData.website_url}
                                    onChange={handleChange}
                                    className="mt-1 w-full p-3 bg-transparent border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    placeholder="https://example.com"
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700 font-medium">Postal Code</span>
                                <input
                                    type="text"
                                    name="postal_code"
                                    value={companyData.postal_code || ''}
                                    onChange={handleChange}
                                    className="mt-1 w-full p-3 bg-transparent border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    placeholder="Enter postal code"
                                    maxLength={4}
                                    minLength={4}
                                />
                            </label>
                        </div>
                        <div className="mt-6">
                            <label className="block">
                                <span className="text-gray-700 font-medium">Profile Picture</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="mt-1 w-full p-3 border border-gray-200 rounded-lg"
                                />
                            </label>
                        </div>
                        <button
                            type="button"
                            onClick={handleUpdateClick}
                            className="mt-4 p-2 bg-green-500 text-white rounded-lg hover:bg-white hover:text-green-500 hover:border-green-600 transition-all duration-300 transform hover:scale-105">
                      Update Profile
                        </button>
                    </form>
                )}
            </div>
        </div>
        </div>
    )
};

export default CompanyProfile;