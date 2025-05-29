import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faIdBadge, faInfoCircle, faPhone, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

const StudentProfile = () => {
    const location = useLocation();
    const { user } = location.state || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const BASE_URL = import.meta.env.VITE_users_API_URL;
    const email = user?.email;
    const [studentData, setstudentData] = useState({
        user: {
            email: user?.email || '',
            full_name: user?.full_name || '',
            usertype: user?.usertype || '',
            password: '',
            areas_of_interest: null,
        },
        id: user?.user_id,
        student_id: user?.student_id || '',
        admission_year: user?.admission_year || null,
        department: user?.department || null,
        graduation_year: user?.graduation_year || null,
        phone_number: user?.phone_number || null,
        bio: user?.bio || '',
        skills: user?.skills || '',
        interests: user?.interests || '',
        activities: user?.activities,
        profile_pic: user?.profile_pic || null,
        achievements: user?.achievements || null,
        professional_experiences: user?.professional_experiences || [],

    });


    useEffect(() => {
        const fetchAlumniProfile = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/users/student/profile/?email=${encodeURIComponent(email)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch your Profile');
                }
                const data = await response.json();
                console.log("Fetched data:", data);

                const ParsedActivities = JSON.parse(data.activities);
                const ParsedProfessional_experiences = JSON.parse(data.professional_experiences);
                const parsedSkills = JSON.parse(data.skills);
                const ParsedAchievements = JSON.parse(data.achievements);
                const parsedIntererest = JSON.parse(data.interests);
                const parsedActivities = Array.isArray(ParsedActivities) ? ParsedActivities : [];
                const parsedAchievements = Array.isArray(ParsedAchievements) ? ParsedAchievements : [];
                const Parsedprofessional_experiences = Array.isArray(ParsedProfessional_experiences) ? ParsedProfessional_experiences : [];
                const ParsedIntererest = Array.isArray(parsedIntererest) ? parsedIntererest : [];
                const ParsedSkills = Array.isArray(parsedSkills) ? parsedSkills : [];

                setstudentData((prevstudentData) => ({
                    ...prevstudentData,

                    user: {
                        email: data.user.email,
                        full_name: data.user.full_name,
                        usertype: data.user.usertype,
                        areas_of_interest: [],
                    },
                    id: data.user_id,
                    student_id: data.student_id || '',
                    admission_year: data.admission_year || '',
                    graduation_year: data.graduation_year || '',
                    department: data.department || '',
                    graduated_year: data.graduated_year || null,
                    phone_number: data.phone_number || null,
                    skills: ParsedSkills,
                    interests: ParsedIntererest,
                    achievements: parsedAchievements,
                    activities: parsedActivities,
                    professional_experiences: Parsedprofessional_experiences,
                    bio: data.bio || '',
                    profile_pic: data.profile_pic || `${BASE_URL}/media/Profile_Picture/default.jpg`,
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

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setstudentData((prevstudentData) => ({
            ...prevstudentData,
            [name]: value,
        }));
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
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };
    const addActivity = () => {
        setstudentData((prevstudentData) => ({
            ...prevstudentData,
            activities: [
                ...prevstudentData.activities,
                { name: '', role: '', description: '', start_date: '', end_date: '' },
            ],
        }));
    };
    const addInterest = () => {
        setstudentData((prevStudentData) => ({
            ...prevStudentData,
            interests: [
                ...prevStudentData.interests,
                { category: '', description: '' },
            ],
        }));
    };
    const addProfessional_Experiance = () => {
        setstudentData((prevstudentData) => ({
            ...prevstudentData,

            professional_experiences: [
                ...prevstudentData.professional_experiences,
                { company_name: '', description: '', start_date: '', end_date: '', position: '', }
            ],
        }));
    };

    const addAchievements = () => {
        setstudentData((prevstudentData) => ({
            ...prevstudentData,
            achievements: [
                ...prevstudentData.achievements,
                { title: '', description: '', date_earned: '', }
            ],
        }));
    };
    const addSkill = () =>{
        setstudentData((prevStudentData) => ({
            ...prevStudentData,
            skills: [
                ...prevStudentData.skills,
                {name: '', level: '' , years_of_experience: '',}
            ]
        })
        )

    };


    const removeInterest = (index) => {
        setstudentData((prevstudentData) => ({
            ...prevstudentData,
            interests: prevstudentData.interests.filter((_, i) => i !== index),
        }));
    };
    const removeActivities = (index) => {
        setstudentData((prevstudentData) => ({
            ...prevstudentData,
            activities: prevstudentData.activities.filter((_, i) => i !== index),
        }));
    };

    const removeExperiance = (index) => {
        setstudentData((prevstudentData) => ({
            ...prevstudentData,
            professional_experiences: prevstudentData.professional_experiences.filter((_, i) => i !== index),
        }));
    };

    const removeAchievements = (index) => {
        setstudentData((prevstudentData) => ({
            ...prevstudentData,
            achievements: prevstudentData.achievements.filter((_, i) => i !== index),
        }));
    };

    const removeSkill = (index)=>{
        setstudentData((prevstudentData)=>({
            ...prevstudentData,
            skills: prevstudentData.skills.filter((_, i) => i !== index),

        }));
    };

    const handleIntestChange = (index, e) => {
        const { name, value } = e.target;
        setstudentData((prevstudentData) => {
            const newInterests = [...prevstudentData.interests];
            newInterests[index] = { ...newInterests[index], [name]: value };
            return { ...prevstudentData, interests: newInterests };
        });
    };

    const handleExperianceChange = (index, e) => {
        const { name, value } = e.target;
        setstudentData((prevstudentData) => {
            const newExperiance = [...prevstudentData.professional_experiences];
            newExperiance[index] = { ...newExperiance[index], [name]: value };
            return { ...prevstudentData, professional_experiences: newExperiance };
        });
    };
    const handleAchievementsChange = (index, e) => {
        const { name, value } = e.target;
        setstudentData((prevstudentData) => {
            const newAchievements = [...prevstudentData.achievements];
            newAchievements[index] = { ...newAchievements[index], [name]: value };
            return { ...prevstudentData, achievements: newAchievements };
        });
    };
    const handleSkillChange =(index, e) => {
        const {name , value} =e.target;
        setstudentData((prevStudentData) =>{
            const newSkills = [...prevStudentData.skills];
            newSkills[index] = {...newSkills[index], [name]: value};
            return { ...prevStudentData, skills: newSkills};
        })

    };



    const handleActivityChange = (index, event) => {
        const { name, value } = event.target;
        setstudentData((prevstudentData) => {
            const updatedActivities = prevstudentData.activities.map((activity, i) => {
                if (i === index) {
                    return { ...activity, [name]: value };
                }
                return activity;
            });
            return { ...prevstudentData, activities: updatedActivities };
        });
    };

    const handleUpdateClick = () => {
        toast.info(
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>Do you want to update?</span>
                <button
                    onClick={() => {
                        handleSubmit();       
                    }}
                    style={{ border: 'none', paddingLeft: '5px', borderRadius: '2px', background: 'transparent', cursor: 'pointer', marginRight: '15px' }}
                >
                    Yes
                    <FontAwesomeIcon icon={faCheck} color="green" />
                </button>
                <button
                    onClick={() => toast.dismiss()}
                    style={{ border: 'none', marginRight: '10px', paddingLeft: '5px', borderRadius: '2px', background: 'transparent', cursor: 'pointer' }}
                >
                    No
                    <FontAwesomeIcon icon={faTimes} color="red" />
                </button>
            </div>,
            {
                position: "top-right",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                toastId: "confirm-toast",
                style: {
                    width: '100%',
                    maxWidth: '500px',
                    boxSizing: 'border-box',
                    padding: '15px'
                },
            }
        );
    };

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }
        
        if(validatePhoneNumber(studentData.phone_number)){
            toast.error(validatePhoneNumber(studentData.phone_number), { position: "top-right" });
            return;
        }
     
        const accessToken = localStorage.getItem(ACCESS_TOKEN);

        const Professional_ExperianceSet = new Set();
        const InterestSet = new Set();
        for (const entry of studentData.interests) {
            if (InterestSet.has(entry.category + entry.description)) {
                toast.error("Duplicate Interest entries are not allowed. ", { position: "top-right" });
                return;
            }
        }
        for (const entry of studentData.professional_experiences) {
            if (Professional_ExperianceSet.has(entry.company_name + entry.position + entry.start_date + entry.end_date)) {
                toast.error("Duplicate experiance entries are not allowed.", { position: "top-right" });
                return;
            }
            Professional_ExperianceSet.add(entry.company_name + entry.position + entry.start_date + entry.end_date + entry.description);
        }

        for (const entry of studentData.professional_experiences) {
            if (!entry.start_date) {
                toast.error("Start year cannot be empty.", { position: "top-right" });
                return;
            }
            const startDate = new Date(entry.start_date);
            const EndDate = new Date(entry.end_date);
            const start_year = startDate.getFullYear();
            const end_Date = EndDate.getFullYear();
            const now = new Date();

            if (start_year < 1980) {
                toast.error("Start year must not be before 1980.", { position: "top-right" });
                return;
            }
            if (start_year > end_Date) {
                toast.error("Start year must not be after the finish year.", { position: "top-right" });
                return;
            }
            if (startDate > now) {
                toast.error("Start year must not be in the future.", { position: "top-right" });
                return;
            }
        }
        for (const entry of studentData.achievements) {
            const DateEarned = new Date(entry.date_earned);
            const now = new Date();

            if (!entry.date_earned || !entry.title || !entry.description) {
                toast.error("Fill all data [Achievement field]", { position: "top-right" });
                return;
            }

            if (DateEarned > now) {
                toast.error("Earned Date must not be in the future. [Achievement field]", { position: "top-right" });
                return;
            }
        }
        for (const entry of studentData.activities) {
            const startDate = new Date(entry.start_date);
            const EndDate = new Date(entry.end_date);
            const now = new Date();
            if (!entry.name || !entry.role || !entry.description || !entry.start_date) {
                toast.error("Fill all fields [Activity Section]", { position: "top-right" });
                return;
            }
            if (startDate > now || startDate > EndDate) {
                toast.error("Start year must not be future [In Activity fields]", { position: "top-right" })
                return;
            }
        }

        try {
            const studentFormData = new FormData;

            studentFormData.append(
                'user',
                JSON.stringify({
                    email: studentData.user.email,
                    full_name: studentData.user.full_name,
                    usertype: studentData.user.usertype,
                    areas_of_interest: studentData.user.areas_of_interest,
                })
            );
            studentFormData.append('student_id', studentData.student_id || "");
            studentFormData.append('department', studentData.department || "");
            studentFormData.append('admission_year', studentData.admission_year || "");
            studentFormData.append('graduation_year', studentData.graduation_year || "");
            studentFormData.append('phone_number', studentData.phone_number || "");
            studentFormData.append('bio', studentData.bio || "");

            if (selectedFile) {
                studentFormData.append('profile_pic', selectedFile);
            } else if (studentFormData.profile_pic) {
                studentFormData.append('profile_pic', studentData.profile_pic);
            }

            if (studentData.skills) {
                studentFormData.append('skills', JSON.stringify(studentData.skills));
            } else {
                studentFormData.append('skills', null);
            }
            if (studentData.interests) {
                studentFormData.append('interests', JSON.stringify(studentData.interests));
            } else {
                studentFormData.append('interests', null);
            }
            if (studentData.achievements) {
                studentFormData.append('achievements', JSON.stringify(studentData.achievements));
            } else {
                studentFormData.append('achievements', null);
            }
            if (studentData.activities) {
                studentFormData.append('activities', JSON.stringify(studentData.activities));
            } else {
                studentFormData.append('activities', null);
            }

            if (studentData.professional_experiences) {
                studentFormData.append('professional_experiences', JSON.stringify(studentData.professional_experiences));
            } else {
                studentFormData.append('professional_experiences', null)
            }
            const response = await fetch(`${BASE_URL}/users/student/profile/update/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: studentFormData
            });



            for (let [key, value] of studentFormData.entries()) {
                console.log(`${key}:`, value);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update profile: ${errorText}`);
            }

            const result = await response.json();
            toast.success("Profile updated successfully!", { position: "top-right" });
        } catch (error) {
            toast.error("Error updating profile: " + error.message, { position: "top-right" });
        }


    }




    return (
        <div className="bg-gray-100 min-h-screen p-4 dark_body">
            <ToastContainer />
            <div className="grid sm:grid-cols-2 gap-6 grid-cols-1">
                <div className=" grid grid-rows-2 gap-4  ">
                    <div className="flex items-center justify-center flex-col bg-gray-50 p-6 login_form">
                        <h1 className="text-2xl font-bold mb-4">{studentData.user.full_name}
                            <span className="text-lg border-l-4 border-orange-500 pl-1 ml-5">
                                {studentData.user.usertype}
                            </span>
                        </h1>
                        <div>
                            {studentData.profile_pic && (
                                <img
                                    src={studentData.profile_pic || `${BASE_URL}/media/Profile_Picture/default.jpg`}
                                    alt="Profile"
                                    className="w-40 h-40 rounded-full border border-gray-300"
                                />
                            )}
                        </div>

                        <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4 mt-10">
                            <span className="font-semibold">Bio:</span> {studentData.bio || 'No bio available.'}
                        </p>
                    </div>
                    <div className="flex items-start justify-center flex-col bg-gray-50 p-6 rounded-lg space-y-4 login_form">
                        <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                            <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-orange-500" />
                            {studentData.user.email}
                        </p>

                        <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-orange-500" />
                            <span className="font-semibold mr-5">Student Id:</span> {studentData.student_id}
                        </p>

                        <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                            <FontAwesomeIcon icon={faPhone} className="mr-2 text-orange-500" />
                            {studentData.phone_number}
                        </p>
                        <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                            <span className="font-semibold mr-5">Department:</span> {studentData.department || ' '}
                        </p>
                        <p className="text-lg flex items-center border-l-2 border-orange-500 pl-4 ml-5">
                            <span className="font-semibold mr-5">Entry year:</span> {studentData.admission_year || 'YYYY '}
                            <span className="font-semibold ml-5">Expected Graduate year:</span> {studentData.graduation_year || 'YYYY'}
                        </p>
                    </div>
                </div>

                <div className=" grid grid-rows-1 gap-4  ">
                    <div className="flex items-center justify-center flex-col bg-gray-50 p-6 login_form">
                        <div className="flex items-start justify-center flex-col bg-gray-60 p-6 rounded-lg  space-y-4 ">
                            <h1 className="text-2xl font-bold mb-4">Your  Status</h1>
                            <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                                <span className="font-semibold mr-5">Skill</span>
                            </p>
                            {Array.isArray(studentData.skills) && studentData.skills.length > 0 ? (
                                studentData.skills.map((skill, index) => (
                                    <div key={index} className="activity-entry ml-5">
                                        <p className="text-lg flex items-center border-l-2 border-orange-500 pl-4 mb-3">{skill.name}</p>
                                        <p className="text-lg flex items-center  pl-4"><span className="ml-2 border-l-2 border-orange-300 pl-4"><strong>Level: </strong>{skill.level}</span>
                                            <span className="border-l-2 border-orange-300 pl-4 ml-4"><strong>Year of Experience:</strong> {skill.years_of_experience}</span>
                                        </p>

                                    </div>
                                ))
                            ) : (
                                <p>No Skill Added.</p>
                            )}

                            <p className="text-lg flex items-center border-l-4 border-orange-500 pl-4">
                                <span className="font-semibold mr-5">Interest</span>
                            </p>
                            {Array.isArray(studentData.interests) && studentData.interests.length > 0 ? (
                                studentData.interests.map((interest, index) => (
                                    <div key={index} className="activity-entry">
                                        <p className="text-lg flex items-center border-l-2 border-orange-500 pl-4 mb-3 ml-5"><span className="mr-2">Category:</span> {interest.category}</p>
                                        <p className="className=text-lg flex items-center border-l-2 border-orange-500 pl-4 ml-10"> {interest.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No Interest found.</p>
                            )}

                            <h1 className="text-xl font-bold text-center text-blue-600 animate-pulse transition duration-300 hover:text-blue-800">
                                View More in Edit Profile Section
                            </h1>

                        </div>
                    </div>

                </div>

            </div>


            {/* Edit part */}

            <div className="bg-gray-50 p-4 w-full mt-6 login_form">

                {studentData && (
                    <div>
                        <button
                            className="mt-4 p-2 bg-blue-500 text-white rounded rounded-lg hover:bg-white hover:text-blue-600 hover:border-blue-600 transition-all duration-300 transform hover:scale-105"
                            onClick={handleEditToggle}
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>

                        {isEditing && (
                            <form className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="w-full mb-10 ">
                                        Bio:
                                        <textarea
                                            name="bio"
                                            value={studentData.bio}
                                            onChange={handleChange}
                                            className="w-full p-3 pr-5.75 flex items-center border border-gray-200 bg-white bg_dark_input rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"
                                        />
                                    </label>
                                    <label className="w-full mb-10 ">
                                        Phone Number:
                                        <input
                                            name="phone_number"
                                            value={studentData.phone_number}
                                            onChange={handleChange}
                                            className="w-full p-3 bg-white bg_dark_input pr-5.75 flex items-center  border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"
                                        />
                                    </label>
                                </div>
                                <h3 className="text-lg font-semibold mt-2 text-center">Interest</h3>
                                <div className="mb-10 border-t border-gray-300"></div>

                                {Array.isArray(studentData.interests) && studentData.interests.length > 0 ? (
                                    studentData.interests.map((interest, index) => (
                                        <div key={index} className="activity-entry grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <label>
                                                <span className="font-bold mb-2">Category:</span>
                                                <input
                                                    type="text"
                                                    name="category"
                                                    value={interest.category || ''}
                                                    onChange={(e) => handleIntestChange(index, e)}
                                                    className="w-full p-3 bg-white bg_dark_input pr-5.75 flex items-center  border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"
                                     
                                                />
                                            </label>
                                            <label>
                                                <span className="font-bold mb-2 ">Description:</span>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    value={interest.description || ''}
                                                    onChange={(e) => handleIntestChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"

                                                />
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() => removeInterest(index)}
                                                className="mt-2 p-1 bg-red-500 text-white rounded w-1/2 mb-2"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))) : []}

                                <button
                                    type="button"
                                    onClick={addInterest}
                                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                                >
                                    Add Interest
                                </button>

                                <h3 className="text-lg font-semibold mt-2 text-center mt-10">Add or View Skil</h3>
                                <div className="mb-10 border-t border-gray-300"></div>
                                {Array.isArray(studentData.skills) && studentData.skills.length > 0 ? (
                                    studentData.skills.map((skill, index) => (
                                        <div key={index} className="activity-entry grid grid-cols-1 lg:grid-cols-2 gap-6">

                                            <label>
                                                <span className="font-bold mb-2">Name(Eg. developer):</span>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={skill.name || ''}
                                                    onChange={(e) => handleSkillChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"

                                                />
                                            </label>

                                            <label>
                                                <span className="font-bold mb-2">Level:</span>
                                                <select
                                                    name="level"
                                                    value={skill.level || ''}
                                                    onChange={(e) => handleSkillChange(index, e)}
                                                    className="w-full p-3 flex bg-white bg_dark_input items-center border border-gray-200 rounded-lg hover:border-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="" disabled>Select Level</option> {/* Placeholder option */}
                                                    <option value="beginner">Beginner</option>
                                                    <option value="intermediate">Intermediate</option>
                                                    <option value="expert">Expert</option>
                                                </select>
                                            </label>
                                            <label>
                                                <span className="font-bold mb-2 ">Year of Experience:</span>
                                                <input
                                                    type="number"
                                                    name="years_of_experience"
                                                    value={skill.years_of_experience || ''}
                                                    onChange={(e) => handleSkillChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"

                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(index)}
                                                className="mt-2 p-1 bg-red-500 text-white rounded w-1/2 mb-2"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))) : []}

                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                                >
                                    Add your Skill
                                </button>



                                <h3 className="text-lg font-semibold mt-2 text-center mt-10">Add or View Activities</h3>
                                {/* Create Line */}
                                <div className="mb-10 border-t border-gray-300"></div>

                                {Array.isArray(studentData.activities) && studentData.activities.length > 0 ? (
                                    studentData.activities.map((activity, index) => (
                                        <div key={index} className="activity-entry grid grid-cols-1 lg:grid-cols-2  gap-6">

                                            <label>
                                                <span className="font-bold mb-2">Name of Activities:</span>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={activity.name || ''}
                                                    onChange={(e) => handleActivityChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"

                                                />
                                            </label>

                                            <label>
                                                <span className="font-bold mb-2">Role:</span>
                                                <input
                                                    type="text"
                                                    name="role"
                                                    value={activity.role || ''}
                                                    onChange={(e) => handleActivityChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"

                                                />
                                            </label>
                                            <label>
                                                <span className="font-bold mb-2 ">Description:</span>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    value={activity.description || ''}
                                                    onChange={(e) => handleActivityChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"

                                                />
                                            </label>
                                            <label>
                                                <span className="font-bold mb-2 ">Start Year:</span>
                                                <input
                                                    type="date"
                                                    name="start_date"
                                                    value={activity.start_date || ''}
                                                    onChange={(e) => handleActivityChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"

                                                />
                                            </label>
                                            <label>
                                                <span className="font-bold mb-2 ">End Date:</span>
                                                <input
                                                    type="date"
                                                    name="end_date"
                                                    value={activity.end_date || ''}
                                                    onChange={(e) => handleActivityChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500"

                                                />
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() => removeActivities(index)}
                                                className="mt-2 p-1 bg-red-500 text-white rounded w-1/2 mb-2"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))) : []}

                                <button
                                    type="button"
                                    onClick={addActivity}
                                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                                >
                                    Add Activities
                                </button>



                                <h3 className="text-lg font-semibold mt-2 text-center mt-10">Add or View Professional Experience</h3>
                                {/* Create Line */}
                                <div className="mb-10 border-t border-gray-300"></div>

                                {Array.isArray(studentData.professional_experiences) && studentData.professional_experiences.length > 0 ? (
                                    studentData.professional_experiences.map((experience, index) => (
                                        <div key={index} className="experience-entry grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <label>
                                                <span className="font-bold mb-2">Name of Company:</span>
                                                <input
                                                    type="text"
                                                    name="company_name"
                                                    value={experience.company_name || ''} // Access it directly from experience
                                                    onChange={(e) => handleExperianceChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500"
                                                />
                                            </label>
                                            <label>
                                                <span className="font-bold mb-2">Position:</span>
                                                <input
                                                    type="text"
                                                    name="position"
                                                    value={experience.position || ''} 
                                                    onChange={(e) => handleExperianceChange(index, e)}
                                                    className="w-full p-3 pr-5.75 flex bg-white bg_dark_input items-center border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500"
                                                />
                                            </label>
                                            <label>
                                                <span className="font-bold mb-2">Start Year:</span>
                                                <input
                                                    type="date"
                                                    name="start_date"
                                                    value={experience.start_date || ''}
                                                    onChange={(e) => handleExperianceChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500"
                                                />
                                            </label>
                                            <label>
                                                <span className="font-bold mb-2">End Date:</span>
                                                <input
                                                    type="date"
                                                    name="end_date"
                                                    value={experience.end_date || ''}
                                                    onChange={(e) => handleExperianceChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500"
                                                />
                                            </label>
                                            <label>
                                                <span className="font-bold mb-2">Description:</span>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    value={experience.description || ''} 
                                                    onChange={(e) => handleExperianceChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500"
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => removeExperiance(index)}
                                                className="mt-2 p-1 bg-red-500 text-white rounded w-1/2 mb-2"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                ) : []}
                                <button
                                    type="button"
                                    onClick={addProfessional_Experiance}
                                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                                >
                                    Add Professional Experience
                                </button>


                                <h3 className="text-lg font-semibold mt-2 text-center mt-10">Achievements</h3>

                                <div className="mb-10 border-t border-gray-300"></div>

                                {Array.isArray(studentData.achievements) && studentData.achievements.length > 0 ? (
                                    studentData.achievements.map((achievement, index) => (
                                        <div key={index} className="experience-entry grid grid-cols-1 lg:grid-cols-2  gap-6">
                                            <label>
                                                <span className="font-bold mb-2">Achievements title:</span>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={achievement.title || ''}
                                                    onChange={(e) => handleAchievementsChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500 mb-5"
                                                />
                                            </label>
                                            <label>
                                                <span className="font-bold mb-2">Date Earned:</span>
                                                <input
                                                    type="date"
                                                    name="date_earned"
                                                    value={achievement.date_earned || ''}
                                                    onChange={(e) => handleAchievementsChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500"
                                                />
                                            </label>


                                            <label>
                                                <span className="font-bold mb-2">Description:</span>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    value={achievement.description || ''}
                                                    onChange={(e) => handleAchievementsChange(index, e)}
                                                    className="w-full p-3 pr-5.75 bg-white bg_dark_input flex items-center border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500 mb-5"
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => removeAchievements(index)}
                                                className="mt-2 p-1 bg-red-500 text-white rounded w-1/2 mb-2 h-10"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                ) : []}
                                <button
                                    type="button"
                                    onClick={addAchievements}
                                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                                >
                                    Add Achievements
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
                                    type="button"
                                    onClick={handleUpdateClick}
                                    className="mt-4 p-2 bg-green-500 text-white rounded"
                                >
                                    Update Profile
                                </button>



                            </form>
                        )}




                    </div>
                )}

            </div>



        </div>
    );
};
export default StudentProfile;