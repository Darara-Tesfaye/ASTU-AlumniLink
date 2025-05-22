import React, { useState } from "react";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import Sidebar from "./Sidebar"; // Adjust path based on your file structure
import { FaPlus, FaEdit, FaTrash, FaCheck } from "react-icons/fa";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Software Engineer",
      company: "TechCorp",
      location: "New York, USA",
      duration: "Full-Time",
      deadline: "2024-04-30",
      status: "Pending",
    },
    {
      id: 2,
      title: "Marketing Manager",
      company: "BizSolutions",
      location: "Remote",
      duration: "Full-Time",
      deadline: "2024-05-15",
      status: "Approved",
    },
    {
      id: 3,
      title: "Data Analyst",
      company: "DataWorks",
      location: "London, UK",
      duration: "Part-Time",
      deadline: "2024-06-01",
      status: "Pending",
    },
  ]);

  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    duration: "",
    deadline: "",
    status: "Pending", // Default status for new jobs
  });

  const [editIndex, setEditIndex] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state

  const handleChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (newJob.title && newJob.company) {
      setJobs([...jobs, { ...newJob, id: jobs.length + 1 }]);
      setNewJob({ title: "", company: "", location: "", duration: "", deadline: "", status: "Pending" });
    } else {
      alert("Please fill in all required fields (Title and Company).");
    }
  };

  const handleEdit = (index) => {
    setNewJob(jobs[index]);
    setEditIndex(index);
  };

  const handleSave = () => {
    const updatedJobs = [...jobs];
    updatedJobs[editIndex] = newJob;
    setJobs(updatedJobs);
    setNewJob({ title: "", company: "", location: "", duration: "", deadline: "", status: "Pending" });
    setEditIndex(null);
  };

  const handleApprove = (id) => {
    setJobs(jobs.map((job) => (job.id === id ? { ...job, status: "Approved" } : job)));
  };

  const handleDelete = (id) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <div className="flex flex-1">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className="flex-1 max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 w-full ml-0 md:ml-16 lg:ml-64">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 sm:mb-8 tracking-tight animate-fade-in-down">
            Manage Job Listings
          </h1>

          {/* Add/Edit Job Form Card */}
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-xl bg-gradient-to-br from-white to-blue-50 border border-blue-100 animate-fade-in-up max-w-7xl mx-auto mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 sm:mb-6 tracking-wide">
              {editIndex !== null ? "Edit Job" : "Add Job"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <input
                type="text"
                name="title"
                placeholder="Job Title *"
                value={newJob.title}
                onChange={handleChange}
                className="p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
              />
              <input
                type="text"
                name="company"
                placeholder="Company *"
                value={newJob.company}
                onChange={handleChange}
                className="p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={newJob.location}
                onChange={handleChange}
                className="p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
              />
              <input
                type="text"
                name="duration"
                placeholder="Duration"
                value={newJob.duration}
                onChange={handleChange}
                className="p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
              />
              <input
                type="date"
                name="deadline"
                value={newJob.deadline}
                onChange={handleChange}
                className="p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
              />
            </div>
            <button
              onClick={editIndex !== null ? handleSave : handleAdd}
              className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-5 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.05] hover:shadow-lg text-sm sm:text-base flex items-center space-x-2"
            >
              {editIndex !== null ? (
                "Save Changes"
              ) : (
                <>
                  <FaPlus /> <span>Add Job</span>
                </>
              )}
            </button>
          </div>

          {/* Jobs Table Card */}
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-xl bg-gradient-to-br from-white to-blue-50 border border-blue-100 animate-fade-in-up max-w-7xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 sm:mb-6 tracking-wide">
              Job Listings
            </h2>
            {jobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md">
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-base font-semibold border border-gray-200 rounded-tl-xl">
                        Title
                      </th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-base font-semibold border border-gray-200">
                        Company
                      </th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-base font-semibold border border-gray-200">
                        Location
                      </th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-base font-semibold border border-gray-200">
                        Duration
                      </th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-base font-semibold border border-gray-200">
                        Deadline
                      </th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-base font-semibold border border-gray-200">
                        Status
                      </th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-base font-semibold border border-gray-200 rounded-tr-xl">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job, index) => (
                      <tr
                        key={job.id}
                        className={`transition-colors duration-200 border border-gray-200 ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-blue-100 hover:shadow-md`}
                      >
                        <td className="p-3 sm:p-4 text-gray-800 text-sm sm:text-base font-medium border border-gray-200">
                          {job.title}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-800 text-sm sm:text-base font-medium border border-gray-200">
                          {job.company}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-800 text-sm sm:text-base font-medium border border-gray-200">
                          {job.location}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-800 text-sm sm:text-base font-medium border border-gray-200">
                          {job.duration}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-800 text-sm sm:text-base font-medium border border-gray-200">
                          {job.deadline}
                        </td>
                        <td
                          className={`p-3 sm:p-4 font-semibold text-sm sm:text-base border border-gray-200 ${
                            job.status === "Approved"
                              ? "text-green-600 animate-pulse-once"
                              : "text-yellow-600 animate-pulse-once"
                          }`}
                        >
                          {job.status}
                        </td>
                        <td className="p-3 sm:p-4 border border-gray-200">
                          <div className="flex space-x-2 sm:space-x-3">
                            {job.status === "Pending" && (
                              <button
                                onClick={() => handleApprove(job.id)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-4 sm:px-5 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.05] hover:shadow-lg text-sm sm:text-base flex items-center space-x-1"
                              >
                                <FaCheck /> <span>Approve</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(index)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-4 sm:px-5 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.05] hover:shadow-lg text-sm sm:text-base flex items-center space-x-1"
                            >
                              <FaEdit /> <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(job.id)}
                              className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold px-4 sm:px-5 py-2 rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-[1.05] hover:shadow-lg text-sm sm:text-base flex items-center space-x-1"
                            >
                              <FaTrash /> <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-600 text-sm sm:text-base font-medium animate-fade-in">
                No jobs available to manage.
              </p>
            )}
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default ManageJobs;