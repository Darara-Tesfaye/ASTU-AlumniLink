import { useState } from "react";
import users_API from "../users_API";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import ASTUlogo from "../assets/images/ASTUlogo.jpg"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faLock, faUser, faEnvelope, faIdCard, faCalendarAlt, faPhone, faUserAlt, faUserTie, faBook, faBriefcase, faGraduationCap, faBuilding, faIndustry, faGlobe, faCity, faMapMarkerAlt, faMailBulk } from '@fortawesome/free-solid-svg-icons';

const userTypes = {
    student: ["full_name", "email", "password", "confirm_password", "student_id", "department", "admission_year", "graduation_year", "phone_number"],
    Alumni: ["full_name", "email", "password", "confirm_password", "subject", "phone_number"],
    staff: ["full_name", "email", "password", "confirm_password", "role"],
    company: ["email", "password", "confirm_password"],
};

const userEndpoints = {
    student: "users/register/student/",
    Alumni: "users/register/alumni/",
    staff: "users/register/staff/",
    company: "users/register/company/",
};

const initialFields = {
    full_name: "",
    email: "",
    phone_number: "",
    student_id: "",
    department: " ",
    admission_year: 2013,
    graduation_year: "",
    subject: "",
    role: "",
    user_type: "student",
    password: "",
    confirm_password: "",
    areas_of_interest: {
        mentoring: false,
        networking: false,
        events: false,
    },

};

function RegisterForm() {
    const [fields, setFields] = useState(initialFields);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("student");
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleNavbar = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark', !isDarkMode);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFields({ ...fields, [name]: value });
        setErrorMessage('');
        setSuccessMessage('');
    };
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFields({
            ...fields,
            areas_of_interest: {
                ...fields.areas_of_interest,
                [name]: checked,
            },
           
        });
    };

    const handleTabChange = (userType) => {
        setActiveTab(userType);
        setFields({ ...initialFields, user_type: userType });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        if (fields.password !== fields.confirm_password) {
            setErrorMessage("Passwords Mismatch.");
            setLoading(false);
            return;
        }


        const userData = {
            user: {
                email: fields.email,
                full_name: fields.full_name,
                usertype: activeTab,
                password: fields.password,
                areas_of_interest : fields.areas_of_interest || null,
            },
            student_id: fields.student_id || "",
            phone_number: fields.phone_number || "",
        };

        if (activeTab === 'student') {
            userData.department = fields.department || null;
            userData.admission_year = fields.admission_year || null;
            userData.graduation_year = parseInt(fields.graduation_year) || null;
        } else if (activeTab === 'Alumni') {
            userData.qualification = fields.qualification || null;
            userData.field_of_study = fields.field_of_study || null;
            userData.graduated_year = parseInt(fields.graduated_year) || null;
            userData.employment_status = fields.employment_status || null;
            userData.company = fields.company || "";
            userData.job_title = fields.job_title || "";
            userData.professional_field = fields.professional_field || "";
            
        }
        else if (activeTab === 'staff') {
            userData.position = fields.position || null;
            userData.department = fields.department || null;
            userData.qualifications = fields.qualifications || null;
            userData.years_of_experience = parseInt(fields.years_of_experience) || null; // Convert to number
            userData.expertise = fields.expertise || null;
            // userData.collaborative_interests = fields.collaborative_interests || null;
        }
        else if (activeTab === 'company') {
            userData.company_name = fields.company_name;
            userData.company_address = fields.company_address;
            userData.company_city = fields.company_city;
            userData.company_country = fields.company_country;
            userData.website_url = fields.website_url;
            userData.contact_person_phone_number = fields.contact_person_number;
        }
        const endpoint = userEndpoints[activeTab];
        console.log("Data sent to backend:", userData);

        try {
            const res = await users_API.post(endpoint, userData);
            setSuccessMessage('Registration successful!');
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate("/login");
        } catch (error) {
            if (error.response) {
                const errors = error.response.data;

                if (typeof errors === 'object') {
                    if (errors.detail) {
                        setErrorMessage(errors.detail);
                    } else if (Array.isArray(errors.non_field_errors)) {
                        setErrorMessage(errors.non_field_errors.join(", "));
                    } else if (errors.user && Array.isArray(errors.user.email)) {
                        setErrorMessage(errors.user.email[0]);
                    }
                    else {
                        // If errors is an object with multiple keys, join the messages
                        const errorMessages = Object.values(errors).flat().join(", ");
                        setErrorMessage(errorMessages);
                    }
                } else {
                    setErrorMessage('An unexpected error occurred.');
                }
            } else {
                setErrorMessage('Network error. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-16 md:pl-4 md:pt-4 bg-gray-100 regform_body">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-1 items-start shadow-lg mx-auto p-2.5 bg-white pl-0 regForm_content">
                <div className="min-h-50 md:min-h-screen bg-gray-100 flex flex-col justify-start md:justify-center items-center p-2 shadow-lg  w-full regForm_left">
                    <button
                        onClick={toggleTheme}
                        className="py-2 px-3 border rounded-md bg-gray-100 dark:bg-gray-800 text-neutral-1000 dark:text-blue transition duration-300 ml-80 toggle-btn"
                    >
                        <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="mr-2" />
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <div className="max-w-md w-full bg-neutral rounded-lg  p-8">
                        <h1 className="text-3xl font-bold text-center mb-4 text-neutral-1000">Welcome to Our Platform!</h1>
                        <p className="text-center mb-6 ">
                            Please register to join our community and gain access to exclusive features.
                        </p>
                        <div className="flex justify-center mb-6">
                            <img
                                src={ASTUlogo}
                                alt="Welcome Illustration"
                                className="rounded-full shadow-lg h-auto w-1/3 md:max-w-full "
                            />
                        </div>
                        <p className="text-center">
                            Already have an account?
                            <a href="/login" className="text-blue-400 hover:underline"> Log in here</a>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-5 rounded-lg shadow-lg col-span-1 md:col-span-2">
                    <h1 className="text-3xl sm:text-6xl lg:text-5xl text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text md:mt-16 mt-4">
                        Create Account
                    </h1>
                    <div
                        className="underline"
                        style={{

                            bottom: '-5px',
                            left: '0',
                            alignItems: 'center',
                            width: '50%',
                            color: 'orange',
                            marginTop: '0.5rem',
                            borderBottom: '3px solid orange',
                            transform: 'translateX(50%)',
                        }}
                    ></div>
                    {/*  <div className="tabs float-right flex gap-2">
                            {Object.keys(userTypes).map(type => (
                                <button
                                    key={type}
                                    className={activeTab === type ? "active" : ""}
                                    onClick={() => handleTabChange(type)}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div> */}
                    <div className="flex flex-col gap-6">
                        <div className="tabs flex justify-end gap-1 m-4 ml-90 ">
                            {Object.keys(userTypes).map(type => (
                                <button
                                    key={type}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-300 
        ${activeTab === type ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}
        hover:underline hover:bg-blue-200`}
                                    onClick={() => handleTabChange(type)}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>



                        {activeTab === "student" && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="full_name" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Full Name<span class="text-red-500"> *</span>
                                        </label>

                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faUserAlt} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="full_name"
                                                id="full_name"
                                                value={fields.full_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="email" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Email<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="email"
                                                name="email"
                                                id="email"
                                                value={fields.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>





                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="student_id" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Student ID<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faIdCard} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="text"
                                                name="student_id"
                                                id="student_id"
                                                value={fields.student_id}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                    </div>

                                    <div className="w-full relative">
                                        <label for="department" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Select a Department<span class="text-red-500"> *</span>
                                        </label>

                                        <select
                                            className="w-full p-3 pr-5.75 border rounded-lg border-gray-200 text-sm font-medium leading-6 shadow-none hover:border-blue-500 focus:border-blue-500 bg-transparent"
                                            name="department"
                                            id="department"
                                            value={fields.department}
                                            onChange={handleChange}
                                        >
                                            <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                                            <option value="Applied Biology Program">Applied Biology Program</option>
                                            <option value="Applied Chemistry">Applied Chemistry</option>
                                            <option value="Applied Physics">Applied Physics</option>
                                            <option value="Applied Geology">Applied Geology</option>
                                            <option value="Applied Mathematics">Applied Mathematics</option>
                                            <option value="Industrial Chemistry">Industrial Chemistry</option>
                                            <option value="Pharmacy Program">Pharmacy Program</option>
                                            <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                                            <option value="Electrical Power and Control Engineering">Electrical Power and Control Engineering</option>
                                            <option value="Software Engineering">Software Engineering</option>
                                            <option value="Architecture">Architecture</option>
                                            <option value="Civil Engineering">Civil Engineering</option>
                                            <option value="Water Resources Engineering">Water Resources Engineering</option>
                                            <option value="Chemical Engineering">Chemical Engineering</option>
                                            <option value="Material Science and Engineering">Material Science and Engineering</option>
                                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="w-full relative">
                                        <label for="admission_year" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Admission Year<span class="text-red-500"> *</span>
                                        </label>

                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="number"
                                                name="admission_year"
                                                id="admission_year"
                                                value={fields.admission_year}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="graduation_year" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Expected graduation year<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="number"
                                                name="graduation_year"
                                                id="graduation_year"
                                                value={fields.graduation_year}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="phone_number" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Phone Number
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faPhone} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="text"
                                                name="phone_number"
                                                id="phone_number"
                                                value={fields.phone_number}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "Alumni" && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="full_name" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Full Name<span class="text-red-500"> *</span>
                                        </label>

                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faUser} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="full_name"
                                                id="full_name"
                                                value={fields.full_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="email" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Email<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="email"
                                                name="email"
                                                id="email"
                                                value={fields.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="full_name" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Full Name<span class="text-red-500"> *</span>
                                        </label>

                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faIdCard} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="student_id"
                                                value={fields.student_id}
                                                onChange={handleChange}
                                                placeholder="Student ID"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="qualification" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Qualification<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faGraduationCap} className="text-gray-500 mr-2" />

                                            <select
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                name="qualification"
                                                id="qualification"
                                                value={fields.qualification}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Qualification</option>
                                                <option value="Bachelor">Bachelor</option>
                                                <option value="Master">Master</option>
                                                <option value="Doctorate">Doctorate</option>
                                                <option value="Bachelor_Doctorate">Both Bachelor and Doctorate</option>
                                                <option value="All">All (Bachelor, Master, Doctorate)</option>
                                                <option value="Doctorate_Master">Doctorate and Master</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="field_of_study" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Field of Study<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <FontAwesomeIcon icon={faBook} className="text-gray-500 mr-2" />

                                            <select
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="password"
                                                id="field_of_study"
                                                name="field_of_study"
                                                value={fields.field_of_study}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Field of Study</option>
                                                <option value="Applied Biology Program">Applied Biology Program</option>
                                                <option value="Applied Chemistry">Applied Chemistry</option>
                                                <option value="Applied Physics">Applied Physics</option>
                                                <option value="Applied Geology">Applied Geology</option>
                                                <option value="Applied Mathematics">Applied Mathematics</option>
                                                <option value="Industrial Chemistry">Industrial Chemistry</option>
                                                <option value="Pharmacy Program">Pharmacy Program</option>
                                                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                                                <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                                                <option value="Electrical Power and Control Engineering">Electrical Power and Control Engineering</option>
                                                <option value="Software Engineering">Software Engineering</option>
                                                <option value="Architecture">Architecture</option>
                                                <option value="Civil Engineering">Civil Engineering</option>
                                                <option value="Water Resources Engineering">Water Resources Engineering</option>
                                                <option value="Chemical Engineering">Chemical Engineering</option>
                                                <option value="Material Science and Engineering">Material Science and Engineering</option>
                                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="w-full relative">
                                        <label for="graduated_year" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Graduated Year<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="number"
                                                name="graduated_year"
                                                id="graduated_year"
                                                value={fields.graduated_year}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="employment_status" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Employment Status<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <FontAwesomeIcon icon={faBriefcase} className="text-gray-500 mr-2" />

                                            <select
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="password"
                                                id="employment_status"
                                                name="employment_status"
                                                value={fields.employment_status}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Employment Status</option>
                                                <option value="Unemployed">Unemployed</option>
                                                <option value="Employed">Employed</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="w-full relative">
                                        <label for="company" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Company Name<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <FontAwesomeIcon icon={faBuilding} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="company"
                                                id="company"
                                                value={fields.company}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="w-full relative">
                                        <label for="job_title" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Job title
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <FontAwesomeIcon icon={faBriefcase} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="job_title"
                                                id="job_title"
                                                value={fields.job_title}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full relative">
                                        <label for="professional_field" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Professional Field
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <FontAwesomeIcon icon={faIndustry} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="professional_field"
                                                id="professional_field"
                                                value={fields.professional_field}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>



                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative col-span-1 ">
                                        <label for="alumni_phone" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Phone Number
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <FontAwesomeIcon icon={faPhone} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="phone_number"
                                                id="alumni_phone"
                                                value={fields.phone_number}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full relative col-span-1 ">
                                        <label className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Areas of Interest
                                        </label>
                                        <div className="flex flex-col items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="mentoring"
                                                    checked={fields.areas_of_interest.mentoring}
                                                    onChange={handleCheckboxChange}
                                                />
                                                Mentoring

                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="networking"
                                                    checked={fields.areas_of_interest.networking}
                                                    onChange={handleCheckboxChange}
                                                />
                                                Networking
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="events"
                                                    checked={fields.areas_of_interest.events}
                                                    onChange={handleCheckboxChange}
                                                />
                                                Events
                                            </label>
                                        </div>
                                    </div>
                                </div>










                            </>
                        )}

                        {activeTab === "staff" && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="staff_full_name" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Full Name<span class="text-red-500"> *</span>
                                        </label>

                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faUser} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="full_name"
                                                id="staff_full_name"
                                                value={fields.full_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="staff_email" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Email<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="email"
                                                name="email"
                                                id="staff_email"
                                                value={fields.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="staff_department" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Department<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faBook} className="text-gray-500 mr-2" />
                                            <select

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="email"
                                                name="department"
                                                id="staff_department"
                                                value={fields.department}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select a Department</option>
                                                <option value="Applied Biology Program">Applied Biology Program</option>
                                                <option value="Applied Chemistry">Applied Chemistry</option>
                                                <option value="Applied Physics">Applied Physics</option>
                                                <option value="Applied Geology">Applied Geology</option>
                                                <option value="Applied Mathematics">Applied Mathematics</option>
                                                <option value="Industrial Chemistry">Industrial Chemistry</option>
                                                <option value="Pharmacy Program">Pharmacy Program</option>
                                                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                                                <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                                                <option value="Electrical Power and Control Engineering">Electrical Power and Control Engineering</option>
                                                <option value="Software Engineering">Software Engineering</option>
                                                <option value="Architecture">Architecture</option>
                                                <option value="Civil Engineering">Civil Engineering</option>
                                                <option value="Water Resources Engineering">Water Resources Engineering</option>
                                                <option value="Chemical Engineering">Chemical Engineering</option>
                                                <option value="Material Science and Engineering">Material Science and Engineering</option>
                                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="position" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Position<span class="text-red-500"> *</span>
                                        </label>

                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faUserTie} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="position"
                                                id="position"
                                                value={fields.position}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="staff_qualification" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Qualification
                                        </label>

                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faGraduationCap} className="text-gray-500 mr-2" />
                                            <select
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                name="qualifications"
                                                id="staff_qualification"
                                                value={fields.qualification}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Qualification</option>
                                                <option value="Bachelor">Bachelor</option>
                                                <option value="Master">Master</option>
                                                <option value="Doctorate">Doctorate</option>
                                                <option value="Bachelor_Doctorate">Both Bachelor and Doctorate</option>
                                                <option value="All">All (Bachelor, Master, Doctorate)</option>
                                                <option value="Doctorate_Master">Doctorate and Master</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="expertise" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Expertise on<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="expertise"
                                                id="expertise"
                                                value={fields.expertise}
                                                onChange={handleChange}
                                            />

                                        </div>
                                    </div>
                                </div>



                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative col-span-1 ">
                                        <label for="years_of_experience" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Year of Experience
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="number"
                                                name="years_of_experience"
                                                id="years_of_experience"
                                                value={fields.years_of_experience}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full relative col-span-1 ">
                                        <label className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Areas of Interest
                                        </label>
                                        <div className="flex flex-col items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="mentoring"
                                                    checked={fields.areas_of_interest.mentoring}
                                                    onChange={handleCheckboxChange}
                                                />
                                                Mentoring

                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="networking"
                                                    checked={fields.areas_of_interest.networking}
                                                    onChange={handleCheckboxChange}
                                                />
                                                Networking
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="events"
                                                    checked={fields.areas_of_interest.events}
                                                    onChange={handleCheckboxChange}
                                                />
                                                Events
                                            </label>
                                        </div>
                                    </div>
                                </div>





                            </>
                        )}


                        {activeTab === "company" && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="company_contactP_name" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Contact Person Full Name<span class="text-red-500"> *</span>
                                        </label>

                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faUser} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="full_name"
                                                id="company_contactP_name"
                                                value={fields.full_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="contact_person_email" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Contact Person Email<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 mr-2" />
                                            <input

                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="email"
                                                name="email"
                                                id="contact_person_email"
                                                value={fields.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="company_Name" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Company Name<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <FontAwesomeIcon icon={faBuilding} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="company_name"
                                                id="company_Name"
                                                value={fields.company_name}
                                                onChange={handleChange}
                                                placeholder="Name of company"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="company_country" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Country<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faGlobe} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="company_country"
                                                value={fields.company_country}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="w-full relative">
                                        <label for="company_city" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            City of Company<span class="text-red-500"> *</span>
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <FontAwesomeIcon icon={faCity} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="company_city"
                                                id="company_city"
                                                value={fields.company_city}
                                                onChange={handleChange}
                                                placeholder="City of company"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="company_address" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Address
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="company_address"
                                                id="company_address"
                                                value={fields.company_address}
                                                onChange={handleChange}
                                                placeholder="Address of company"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="w-full relative">
                                        <label for="postal_code" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Postal Code
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">
                                            <FontAwesomeIcon icon={faMailBulk} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="text"
                                                name="postal_code"
                                                id="postal_code"
                                                value={fields.postal_code}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="company_website_url" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Website of Company
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faGlobe} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="url"
                                                name="website_url"
                                                id="company_website_url"
                                                value={fields.website_url}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full relative">
                                        <label for="contact_person_number" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                            Phone No of Contact Person
                                        </label>
                                        <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                            <FontAwesomeIcon icon={faPhone} className="text-gray-500 mr-2" />
                                            <input
                                                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                                type="tel"
                                                name="contact_person_number"
                                                id="contact_person_number"
                                                value={fields.contact_person_number}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>


                            </>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full relative">
                                <label for="password" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                    Password<span class="text-red-500"> *</span>
                                </label>
                                <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                    <FontAwesomeIcon icon={faLock} className="text-gray-500 mr-2" />
                                    <input

                                        className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="password"
                                        name="password"
                                        id="password"
                                        value={fields.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <div className="w-full relative">


                                <label for="confirm_password" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                    Confirm Password<span class="text-red-500"> *</span>
                                </label>
                                <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

                                    <FontAwesomeIcon icon={faLock} className="text-gray-500 mr-2" />
                                    <input

                                        className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                        type="password"
                                        name="confirm_password"
                                        id="confirm_password"
                                        value={fields.confirm_password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                    {loading && <LoadingIndicator />}
                    {errorMessage && <div className="text-white bg-red-500 text-center m-4 mx-10 h-10 p-2">{errorMessage}</div>}
                    {successMessage && <div className="text-green-500">{successMessage}</div>}
                    <button className="float-right w-6/12 p-2.5 my-5 bg-blue-500 text-white border-none rounded-md cursor-pointer transition duration-200 ease-in-out hover:bg-blue-600" type="submit">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterForm;