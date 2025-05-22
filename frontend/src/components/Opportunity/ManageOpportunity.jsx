import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN } from '../../constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageOpportunities = () => {
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        description: '',
        type: 'internship',
        departments: {
            computerScience: false,
            appliedBiology: false,
            appliedChemistry: false,
            appliedPhysics: false,
            appliedGeology: false,
            appliedMathematics: false,
            industrialChemistry: false,
            pharmacy: false,
            electronics: false,
            electricalEngineering: false,
            softwareEngineering: false,
            architecture: false,
            civilEngineering: false,
            waterResources: false,
            chemicalEngineering: false,
            materialScience: false,
            mechanicalEngineering: false,
        },
        batch: '',
        area: '',
        startDate: '',
        endDate: '',
        experienceYears: '',
        fieldOfStudy: '',
        placeOfWork: '',
        salary: '',
    });
    const location = useLocation();
    const { user } = location.state || {};
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeForm, setActiveForm] = useState(null);
    const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const [expandedOpportunities, setExpandedOpportunities] = useState({});

    const departmentNames = {
        appliedBiology: 'Applied Biology Program',
        appliedChemistry: 'Applied Chemistry',
        appliedPhysics: 'Applied Physics',
        appliedGeology: 'Applied Geology',
        appliedMathematics: 'Applied Mathematics',
        industrialChemistry: 'Industrial Chemistry',
        pharmacy: 'Pharmacy Program',
        computerScience: 'Computer Science and Engineering',
        electronics: 'Electronics & Communication Engineering',
        electricalEngineering: 'Electrical Power and Control Engineering',
        softwareEngineering: 'Software Engineering',
        architecture: 'Architecture',
        civilEngineering: 'Civil Engineering',
        waterResources: 'Water Resources Engineering',
        chemicalEngineering: 'Chemical Engineering',
        materialScience: 'Material Science and Engineering',
        mechanicalEngineering: 'Mechanical Engineering',
    };

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/events/opportunities/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Unauthorized. Please log in.', { position: 'top-right' });
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch opportunities');
            }
            const data = await response.json();
            const userOpportunities = data.filter(opportunity => opportunity.created_by === user.id);
            setOpportunities(userOpportunities);
        } catch (error) {
            toast.error('Failed to fetch opportunities', { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    };

    const handleListBtn = () => {
        navigate('/applicant', { state: { user } });
    };

    const handleJobListBtn = () => {
        navigate('/job-applicant', { state: { user } });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleViewToggle = (id) => {
        setExpandedOpportunities((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleDepartmentChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            departments: { ...prev.departments, [name]: checked },
        }));
    };

    const validateDate = (dateStr) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateStr)) return false;
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    };

    const validateDates = (startDate, endDate, type) => {
        if (type !== 'internship') return true;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start <= today) {
            toast.error('Start date must be in the future.', { position: 'top-right' });
            return false;
        }

        const oneYearFromNow = new Date(today);
        oneYearFromNow.setFullYear(today.getFullYear() + 1);
        if (start > oneYearFromNow) {
            toast.error('For internships: Start date must be within one year from today.', { position: 'top-right' });
            return false;
        }
        const oneMonthAfterStart = new Date(start);
        oneMonthAfterStart.setMonth(start.getMonth() + 1);
        if (end < oneMonthAfterStart) {
            toast.error('Minimum duration of internship program one month', { position: 'top-right' });
            return false;
        }

        return true;
    };

    const validateExperienceYears = (years) => {
        if (!years && years !== '0') return true;
        const numYears = parseInt(years, 10);
        if (isNaN(numYears) || numYears < 0 || numYears > 30) {
            toast.error('Experience years must be between 0 and 30.', { position: 'top-right' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const selectedDepartments = Object.entries(formData.departments)
            .filter(([_, selected]) => selected)
            .map(([key]) => departmentNames[key])
            .filter(name => name); // Exclude undefined mappings

        if (!validateDates(formData.startDate, formData.endDate, formData.type)) {
            setLoading(false);
            return;
        }

        if (!validateExperienceYears(formData.experienceYears)) {
            setLoading(false);
            return;
        }

        const payload = {
            title: formData.title,
            description: formData.description,
            type: formData.type || null,
            departments: selectedDepartments.length > 0 ? selectedDepartments : [],
            batch: formData.batch,
            area: formData.area,
            experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : null,
            field_of_study: formData.fieldOfStudy || '',
            salary: formData.salary || '',
            place_of_work: formData.placeOfWork || '',
            is_approved: false,
            created_by: user.id,
        };

        if (formData.type === 'internship') {
            payload.start_date = formData.startDate;
            payload.end_date = formData.endDate;
        } else {
            payload.start_date = formData.startDate && validateDate(formData.startDate) ? formData.startDate : null;
            payload.end_date = formData.endDate && validateDate(formData.endDate) ? formData.endDate : null;
        }

        try {
            let response;
            if (formData.id) {
                response = await fetch(`${BASE_URL}/events/opportunities/${formData.id}/`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
            } else {
                response = await fetch(`${BASE_URL}/events/opportunities/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create/update opportunity');
            }

            toast.success(formData.id ? 'Opportunity updated successfully!' : 'Opportunity created successfully!', { position: 'top-right' });
            fetchOpportunities();
            resetForm();
        } catch (error) {
            toast.error(`Failed to create/update opportunity: ${error.message}`, { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            title: '',
            description: '',
            type: 'internship',
            departments: {
                computerScience: false,
                appliedBiology: false,
                appliedChemistry: false,
                appliedPhysics: false,
                appliedGeology: false,
                appliedMathematics: false,
                industrialChemistry: false,
                pharmacy: false,
                electronics: false,
                electricalEngineering: false,
                softwareEngineering: false,
                architecture: false,
                civilEngineering: false,
                waterResources: false,
                chemicalEngineering: false,
                materialScience: false,
                mechanicalEngineering: false,
            },
            batch: '',
            area: '',
            startDate: '',
            endDate: '',
            experienceYears: '',
            fieldOfStudy: '',
            placeOfWork: '',
            salary: '',
        });
        setActiveForm(null);
    };

    const handleEdit = (opportunity) => {
        const departmentState = {};
        Object.keys(formData.departments).forEach(key => {
            departmentState[key] = opportunity.departments.includes(departmentNames[key]);
        });

        setFormData({
            id: opportunity.id,
            title: opportunity.title,
            description: opportunity.description,
            type: opportunity.type,
            departments: departmentState,
            batch: opportunity.batch || '',
            area: opportunity.area || '',
            startDate: opportunity.start_date || '',
            endDate: opportunity.end_date || '',
            experienceYears: opportunity.experience_years || '',
            fieldOfStudy: opportunity.field_of_study || '',
            placeOfWork: opportunity.place_of_work || '',
            salary: opportunity.salary || '',
        });
        setActiveForm(opportunity.type);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this opportunity?')) {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/events/opportunities/${id}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to delete opportunity');
                }
                toast.success('Opportunity deleted successfully!', { position: 'top-right' });
                fetchOpportunities();
            } catch (error) {
                toast.error(`Failed to delete opportunity: ${error.message}`, { position: 'top-right' });
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleForm = (type) => {
        if (activeForm === type) {
            setActiveForm(null);
            setFormData({ ...formData, type: 'internship' });
        } else {
            setActiveForm(type);
            setFormData({ ...formData, type });
        }
    };

    const getDepartmentDisplayNames = (departments) => {
        if (!departments || departments.length === 0) return 'None';
        return departments
            .filter(name => name)
            .join(', ');
    };

    return (
        <div className="max-w-8xl mx-auto p-6 bg-gray-100 dark_body">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Manage Opportunities</h1>
            <p className="mb-4">
                This page allows you to create internship and job opportunities for students and alumni at ASTU.
                Select the relevant fields and submit your opportunity to help students and alumni gain valuable experience.
            </p>
            <div className="mb-6">
                <button
                    onClick={() => toggleForm('internship')}
                    className="w-1/3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-white hover:to-white hover:text-blue-600 hover:border-blue-600 border transition-all duration-300 transform hover:scale-105"
                >
                    Create Internship Opportunity for Students
                </button>
                <button
                    onClick={() => toggleForm('Job')}
                    className="w-1/4 ml-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-white hover:to-white hover:text-blue-600 hover:border-blue-600 border transition-all duration-300 transform hover:scale-105"
                >
                    Create Job Opportunity for Alumni
                </button>
                <button
                    className="w-1/4 ml-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-white hover:to-white hover:text-blue-600 hover:border-blue-600 border transition-all duration-300 transform hover:scale-105"
                    onClick={() => handleListBtn()}
                >
                    List of Intern Applicants
                </button>
                <button
                    className="w-1/4 ml-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-white hover:to-white hover:text-blue-600 hover:border-blue-600 border transition-all duration-300 transform hover:scale-105"
                    onClick={() => handleJobListBtn()}
                >
                    List of Job Applicants
                </button>
            </div>

            {activeForm === 'internship' && (
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6 event-label">
                    <h2 className="text-xl font-bold mb-4">Internship Opportunity</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Opportunity Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full p-3 bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full p-3 bg-transparent border row-2 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Batch</label>
                            <select
                                name="batch"
                                value={formData.batch}
                                onChange={handleChange}
                                required
                                className="w-full p-3 bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                <option value="">Select a Batch</option>
                                <option value="2nd">2nd Year</option>
                                <option value="3rd">3rd Year</option>
                                <option value="4th">4th Year</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Area of Internship</label>
                            <select
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                className="w-full p-3 bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                <option value="website">Website Development</option>
                                <option value="construction">Construction</option>
                                <option value="data science">Data Science</option>
                                <option value="Robotics">Robotics</option>
                                <option value="software Development">Software Development</option>
                                <option value="networking">Networking</option>
                                <option value="data analysis">Data Analysis</option>
                                <option value="machine learning">Machine Learning</option>
                                <option value="artificial intelligence">Artificial Intelligence</option>
                                <option value="cyber security">Cyber Security</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                className="w-full p-3 bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Departments</label>
                        <div className="flex flex-col">
                            {Object.keys(departmentNames).map((key) => (
                                <label key={key} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name={key}
                                        checked={formData.departments[key]}
                                        onChange={handleDepartmentChange}
                                        className="mr-2 bg-transparent border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                                    />
                                    {departmentNames[key]}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : formData.id ? 'Update Internship Opportunity' : 'Create Internship Opportunity'}
                    </button>
                </form>
            )}

            {activeForm === 'Job' && (
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6 event-label">
                    <h2 className="text-xl font-bold mb-4">Job Opportunity for Alumni</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Job Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full bg-transparent p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Experience Years</label>
                            <input
                                type="number"
                                name="experienceYears"
                                value={formData.experienceYears}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Field of Study</label>
                            <select
                                name="fieldOfStudy"
                                value={formData.fieldOfStudy}
                                onChange={handleChange}
                                required
                                className="w-full p-3 bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                <option value="">Select a Department</option>
                                {Object.values(departmentNames).map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Place of Work</label>
                            <input
                                type="text"
                                name="placeOfWork"
                                value={formData.placeOfWork}
                                onChange={handleChange}
                                required
                                className="w-full p-3 bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Salary</label>
                            <input
                                type="text"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                required
                                className="w-full p-3 bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : formData.id ? 'Update Job Opportunity' : 'Create Job Opportunity for Alumni'}
                    </button>
                </form>
            )}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark_text">
                    Your Opportunities
                </h2>
                {opportunities.length > 0 ? (
                    <ul className="space-y-4">
                        {opportunities.map((opp) => (
                            <li
                                key={opp.id}
                                className="p-4 bg-gray-50 rounded-lg shadow-sm event-box"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {opp.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(opp.created_on).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-black-500">
                                            Status:{' '}
                                            {opp.is_approved ? (
                                                <span className="bg-green-500 text-white px-2 py-1 rounded">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="bg-amber-500 text-white px-2 py-1 rounded">
                                                    Pending Approval
                                                </span>
                                            )}
                                        </p>
                                        {expandedOpportunities[opp.id] && (
                                            <div className="mt-2 text-gray-600">
                                                <p>
                                                    <strong>Description:</strong> {opp.description}
                                                </p>
                                                <p>
                                                    <strong>Type:</strong> {opp.type}
                                                </p>
                                                {opp.batch && (
                                                    <p>
                                                        <strong>Batch:</strong> {opp.batch}
                                                    </p>
                                                )}
                                                {opp.area && (
                                                    <p>
                                                        <strong>Area:</strong> {opp.area}
                                                    </p>
                                                )}
                                                {opp.start_date && (
                                                    <p>
                                                        <strong>Start Date:</strong> {opp.start_date}
                                                        {new Date(opp.start_date) > new Date() ? (
                                                            <span> - Upcoming</span>
                                                        ) : (
                                                            <span> - Past</span>
                                                        )}
                                                    </p>
                                                )}
                                                {opp.end_date && (
                                                    <p>
                                                        <strong>End Date:</strong> {opp.end_date}
                                                    </p>
                                                )}
                                                <p>
                                                    <strong>Experience Years:</strong> {opp.experience_years ?? 'N/A'}
                                                </p>
                                                {opp.salary && (
                                                    <p>
                                                        <strong>Salary:</strong> {opp.salary}
                                                    </p>
                                                )}
                                                {opp.place_of_work && (
                                                    <p>
                                                        <strong>Place of Work:</strong> {opp.place_of_work}
                                                    </p>
                                                )}
                                                <p>
                                                    <strong>Departments:</strong>{' '}
                                                    {opp.type === 'internship'
                                                        ? getDepartmentDisplayNames(opp.departments)
                                                        : opp.field_of_study || 'None'}
                                                </p>
                                                <p>
                                                    <strong>Created By:</strong>{' '}
                                                    {opp.company_profile?.user?.full_name || 'Unknown'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 sm:mt-0 flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(opp)}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            aria-label={`Edit ${opp.title}`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(opp.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                            aria-label={`Delete ${opp.title}`}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => handleViewToggle(opp.id)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            aria-label={
                                                expandedOpportunities[opp.id]
                                                    ? `View less details for ${opp.title}`
                                                    : `View more details for ${opp.title}`
                                            }
                                        >
                                            {expandedOpportunities[opp.id] ? 'View Less' : 'View More'}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No opportunities found.</p>
                )}
            </div>
        </div>
    );
};

export default ManageOpportunities;