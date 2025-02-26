import "../styles/form.css";
import { useState } from "react";
import users_API from "../users_API";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import ASTUlogo from "../assets/images/ASTUlogo.jpg"
import { Link } from "react-router-dom";

const userTypes = {
    student: ["full_name", "email", "password", "confirm_password", "student_id", "department", "admission_year", "graduation_year", "phone_number"],
    Alumni: ["full_name", "email", "password", "confirm_password", "subject", "phone_number"],
    staff: ["full_name", "email", "password", "confirm_password", "role"],
    company: ["email", "password", "confirm_password"],
};

const userEndpoints = {
    student: "register/student/",
    Alumni: "register/alumni/",
    staff: "register/staff/",
    company: "register/company/",
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
    collaborative_interests:{
        mentoring: false,
        networking: false,
        events: false,
    }
};

function RegisterForm() {
    const [fields, setFields] = useState(initialFields);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("student"); 
    const [errorMessage, setErrorMessage] = useState(''); 
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

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
            collaborative_interests:{
                ...fields.areas_of_interest,
                [name]: checked,
            }

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
            userData.areas_of_interest = fields.areas_of_interest || null;
        }
        else if (activeTab === 'staff') {
            userData.position = fields.position || null;
            userData.department = fields.department || null;
            userData.qualifications = fields.qualifications || null;
            userData.years_of_experience = parseInt(fields.years_of_experience) || null; // Convert to number
            userData.expertise = fields.expertise || null;
            userData.collaborative_interests = fields.collaborative_interests || null;
        }
        else if(activeTab=== 'company'){

            userData.company_name = fields.company_name;
            userData.company_address =fields.company_address;
            userData.company_city = fields.company_city;
            userData.company_country = fields.company_country;
            userData.website_url =fields.website_url;
            userData.contact_person_phone_number = fields.contact_person_number;
        }
        const endpoint = userEndpoints[activeTab];

        try {
            const res = await users_API.post(endpoint, userData);
            setSuccessMessage('Registration successful!');
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate("/");
        } catch (error) {
            if (error.response) {
                const errors = error.response.data;
        
                if (typeof errors === 'object') {
                    // Check for a detail field directly
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
        <div>
            <div className="registerationpage">
                <div className="left-registrationpage">
                    <div className="register-left-wrap">
                    <a 
                        style={{ 
                            maxWidth: '9.375rem', 
                            marginBottom: '1.625rem', 
                            display: 'inline-block' 
                        }} 
                        href="https://astu.edu.et"
                    >
                        <img 
                            src={ASTUlogo} 
                            alt="ASTU | Adama Science and Technology University" 
                            style={{ 
                                borderRadius: '50%', 
                                border: 'none', 
                                maxWidth: '100%', 
                                height: 'auto', 
                                verticalAlign: 'middle', 
                                cursor: 'pointer' 
                            }} 
                        />
                    </a>
                    
                    <h2 className="h2 register_welcome">Wel Come</h2>



                    </div>

                </div>
        
            
            <form onSubmit={handleSubmit} className="form-container">
            <h1>Create Account</h1>
            <h4 className="h4" style={{marginBottom: '1rem' }}>Already have an account? 
            <Link to="/login" className="link-text">Sign In</Link>
            </h4>
            <div className="tabs">
                {Object.keys(userTypes).map(type => (
                    <button
                        key={type}
                        className={activeTab === type ? "active" : ""}
                        onClick={() => handleTabChange(type)}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>
                {activeTab === "student" && (
                    <>
                        <input
                            className="form-input"
                            type="text"
                            name="full_name"
                            value={fields.full_name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            required
                        />
                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            value={fields.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="student_id"
                            value={fields.student_id}
                            onChange={handleChange}
                            placeholder="Student ID"
                            required
                        />
                        <select
                            className="form-input"
                            name="department"
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
                        <input
                            className="form-input"
                            type="number"
                            name="admission_year"
                            value={fields.admission_year}
                            onChange={handleChange}
                            placeholder="Admission Year"
                        />
                        <input
                            className="form-input"
                            type="number"
                            name="graduation_year"
                            value={fields.graduation_year}
                            onChange={handleChange}
                            placeholder="Graduation Year"
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="phone_number"
                            value={fields.phone_number}
                            onChange={handleChange}
                            placeholder="Phone Number"
                        />
                    </>
                )}

                {activeTab === "Alumni" && (
                    <>
                        <input
                            className="form-input"
                            type="text"
                            name="full_name"
                            value={fields.full_name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            required
                        />
                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            value={fields.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="student_id"
                            value={fields.student_id}
                            onChange={handleChange}
                            placeholder="Student ID"
                        />
                        <select
                            className="form-input"
                            name="qualification"
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
                        <select
                            className="form-input"
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
                        <input
                            className="form-input"
                            type="number"
                            name="graduated_year"
                            value={fields.graduated_year}
                            onChange={handleChange}
                            placeholder="Graduated Year"
                            required
                        />
                        <select
                            className="form-input"
                            name="employment_status"
                            value={fields.employment_status}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Employment Status</option>
                            <option value="Unemployed">Unemployed</option>
                            <option value="Employed">Employed</option>
                        </select>
                        <input
                            className="form-input"
                            type="text"
                            name="company"
                            value={fields.company}
                            onChange={handleChange}
                            placeholder="Company"
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="job_title"
                            value={fields.job_title}
                            onChange={handleChange}
                            placeholder="Job Title"
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="professional_field"
                            value={fields.professional_field}
                            onChange={handleChange}
                            placeholder="Professional Field"
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="phone_number"
                            value={fields.phone_number}
                            onChange={handleChange}
                            placeholder="Phone Number"
                        />
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
                        
                    </>
                )}

            {activeTab === "staff" && (
                <>
                     <input
                            className="form-input"
                            type="text"
                            name="full_name"
                            value={fields.full_name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            required
                        />
                   <input
                            className="form-input"
                            type="email"
                            name="email"
                            value={fields.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                    
                    <input
                        className="form-input"
                        type="text"
                        name="position"
                        value={fields.position}
                        onChange={handleChange}
                        placeholder="Position"
                    />
                     <select
                            className="form-input"
                            name="department"
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
                        <select
                            className="form-input"
                            name="qualifications"
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
                    <input
                        className="form-input"
                        type="number"
                        name="years_of_experience"
                        value={fields.years_of_experience}
                        onChange={handleChange}
                        placeholder="Years of Experience"
                    />
                    <input
                        className="form-input"
                        type="text"
                        name="expertise"
                        value={fields.expertise}
                        onChange={handleChange}
                        placeholder="Expertise"
                    />
                   
                    <label>
                        <input
                            type="checkbox"
                            name="mentoring"
                            checked={fields.collaborative_interests.mentoring}
                            onChange={handleCheckboxChange}
                        />
                        Mentoring

                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="networking"
                            checked={fields.collaborative_interests.networking}
                            onChange={handleCheckboxChange}
                        />
                        Networking
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="events"
                            checked={fields.collaborative_interests.events}
                            onChange={handleCheckboxChange}
                        />
                        Events
                    </label>
                   
                </>
            )}


                {activeTab === "company" && (
                    <>
                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            value={fields.email}
                            onChange={handleChange}
                            placeholder="Email of contact person"
                            required
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="full_name"
                            value={fields.full_name}
                            onChange={handleChange}
                            placeholder="Full Name of contact person"
                            required
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="company_name"
                            value={fields.company_name}
                            onChange={handleChange}
                            placeholder="Name of company"
                            required
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="company_address"
                            value={fields.company_address}
                            onChange={handleChange}
                            placeholder="Address of company"
                        
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="company_city"
                            value={fields.company_city}
                            onChange={handleChange}
                            placeholder="City of company"
                            required
                        />
                        <input
                            className="form-input"
                            type="text"
                            name="company_country"
                            value={fields.company_country}
                            onChange={handleChange}
                            placeholder="Country of company"
                            required
                        />
                        <input 
                            className="form-input"
                            type="text"
                            name="postal_code"
                            value={fields.postal_code}
                            onChange={handleChange}
                            placeholder="Postal Code"

                        />
                        <input
                            className="form-input"
                            type="url"
                            name="website_url"
                            value={fields.website_url}
                            onChange={handleChange}
                            placeholder="Your company url"
                        />
                        <input
                            type="number"
                            className="form-input"
                            name="contact_person_number"
                            value={fields.contact_person_number}
                            onChange={handleChange}
                            placeholder="Contact Person Phone"
                        />
                        

                    </>
                )}

                <input
                    className="form-input"
                    type="password"
                    name="password"
                    value={fields.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    autoComplete="new-password" // Added autocomplete attribute
                />
                <input
                    className="form-input"
                    type="password"
                    name="confirm_password"
                    value={fields.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    required
                    autoComplete="new-password" // Added autocomplete attribute
                />

                {loading && <LoadingIndicator />}
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                <button className="form-button" type="submit">
                    Register
                </button>
            </form>
            </div>
        </div>
    );
}

export default RegisterForm;