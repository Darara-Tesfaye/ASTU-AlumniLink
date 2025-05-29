import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faLink, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import LoadingIndicator from "../LoadingIndicator";
import { format } from "date-fns";

const ResourceShareUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = location.state || {};
  const userId = user ? user.id : null;
  const isStaff = user?.usertype === "staff";
  const BASE_URL = import.meta.env.VITE_users_API_URL || "http://127.0.0.1:8000";
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  const [formData, setFormData] = useState({
    department: "",
    batch: "",
    course: "",
    resource_type: "",
    title: "",
    description: "",
    file: null,
    url: "",
  });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState({ form: false, list: false, delete: false });

  console.log("User:", user);

  const DEPARTMENT_CHOICES = [
    "Applied Biology Program",
    "Applied Chemistry",
    "Applied Physics",
    "Applied Geology",
    "Applied Mathematics",
    "Industrial Chemistry",
    "Pharmacy Program",
    "Computer Science and Engineering",
    "Electronics & Communication Engineering",
    "Electrical Power and Control Engineering",
    "Software Engineering",
    "Architecture",
    "Civil Engineering",
    "Water Resources Engineering",
    "Chemical Engineering",
    "Material Science and Engineering",
    "Mechanical Engineering",
  ];

  const RESOURCE_TYPE_CHOICES = ["text", "book", "ppt", "file", "url"];

  useEffect(() => {
    if (!accessToken || !userId) {
      toast.error("Please log in.", { position: "top-right" });
      navigate("/logout");
      return;
    }

    const fetchResources = async () => {
      setLoading((prev) => ({ ...prev, list: true }));
      try {
        const response = await fetch(`${BASE_URL}/events/access-resource-share/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Unauthorized. Please log in.", { position: "top-right" });
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch resources");
        }
        const data = await response.json();
        const userResources = data.filter((resource) => resource.staff === userId);
        setResources(userResources);
      } catch (error) {
        toast.error("Error: " + error.message, { position: "top-right" });
      } finally {
        setLoading((prev) => ({ ...prev, list: false }));
      }
    };

    fetchResources();
  }, [accessToken, userId, isStaff, navigate]);

  console.log("Resources:", resources);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { department, batch, course, resource_type, title, file, url } = formData;

    if (!department || !batch || !course || !resource_type || !title) {
      toast.error("Please fill all required fields.", { position: "top-right" });
      return;
    }
    if (resource_type !== "url" && !file) {
      toast.error("Please upload a file for this resource type.", { position: "top-right" });
      return;
    }
    if (resource_type === "url" && !url) {
      toast.error("Please provide a URL for this resource type.", { position: "top-right" });
      return;
    }
    if (department !== profile?.department) {
      toast.error("You can only share resources in your own department.", { position: "top-right" });
      return;
    }

    const getCurrentEthiopianYear = () => {
      const currentYear = new Date().getFullYear();
      return currentYear - 8;
    };

    const currentEthiopianYear = getCurrentEthiopianYear();
    const batchYear = parseInt(batch);
    if (batchYear > currentEthiopianYear || batchYear < currentEthiopianYear - 5) {
      toast.error("Invalid batch year", { position: "top-right" });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("staff", userId);
    formDataToSend.append("department", department);
    formDataToSend.append("batch", batch);
    formDataToSend.append("course", course);
    formDataToSend.append("resource_type", resource_type);
    formDataToSend.append("title", title);
    if (formData.description) formDataToSend.append("description", formData.description);
    if (file) formDataToSend.append("file", file);
    if (url) formDataToSend.append("url", url);

    setLoading((prev) => ({ ...prev, form: true }));
    try {
      const response = await fetch(`${BASE_URL}/events/resource-share/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formDataToSend,
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Unauthorized. Please log in.", { position: "top-right" });
          navigate("/login");
          return;
        }
        throw new Error(`Failed to share resource: ${response.statusText}`);
      }

      await response.json();
      setFormData({
        department: "",
        batch: "",
        course: "",
        resource_type: "",
        title: "",
        description: "",
        file: null,
        url: "",
      });
      toast.success("Resource shared successfully!", { position: "top-right" });

      const refreshResponse = await fetch(`${BASE_URL}/events/access-resource-share/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setResources(data.filter((resource) => resource.staff === userId));
      }
    } catch (err) {
      toast.error("Error: " + err.message, { position: "top-right" });
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const response = await fetch(`${BASE_URL}/events/delete-resource-share/${resourceId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Unauthorized. Please log in.", { position: "top-right" });
          navigate("/login");
          return;
        }
        throw new Error("Failed to delete resource");
      }
      toast.success("Resource deleted successfully!", { position: "top-right" });
      setResources((prev) => prev.filter((resource) => resource.id !== resourceId));
    } catch (error) {
      toast.error("Error: " + error.message, { position: "top-right" });
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
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
              <label className="block text-gray-700 dark_text mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {DEPARTMENT_CHOICES.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark_text mb-2">
                Batch <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-gray-700 dark_text mb-2">
                Course <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-gray-700 dark_text mb-2">
                Resource Type <span className="text-red-500">*</span>
              </label>
              <select
                name="resource_type"
                value={formData.resource_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                {RESOURCE_TYPE_CHOICES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 dark_text mb-2">
                Title <span className="text-red-500">*</span>
              </label>
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
            {formData.resource_type && formData.resource_type !== "url" && (
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark_text mb-2">
                  File Upload <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="file"
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            {formData.resource_type === "url" && (
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark_text mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
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
          {loading.form && <LoadingIndicator />}
          <button
            type="submit"
            disabled={loading.form}
            className={`mt-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 ${
              loading.form ? "opacity-50 cursor-not-allowed" : "hover:from-white hover:to-white hover:text-blue-600 hover:border-blue-600 border"
            }`}
          >
            {loading.form ? (
              <div className="flex items-center">Sharing...</div>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Share Resource
              </>
            )}
          </button>
        </form>

        {/* Resource List */}
        {isStaff && (
          <div className="mt-8 p-8 bg-white rounded-xl shadow-lg dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 dark_text">Your Shared Resources</h2>
            {loading.list ? (
              <LoadingIndicator />
            ) : resources.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Title</th>
                      <th className="p-2 border">Resource Type</th>
                      <th className="p-2 border">Department</th>
                      <th className="p-2 border">Batch</th>
                      <th className="p-2 border">Course</th>
                      <th className="p-2 border">Created On</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource) => (
                      <tr key={resource.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{resource.title}</td>
                        <td className="p-2">{resource.resource_type}</td>
                        <td className="p-2">{resource.department}</td>
                        <td className="p-2">{resource.batch}</td>
                        <td className="p-2">{resource.course}</td>
                        <td className="p-2">
                          {resource.created_on
                            ? format(new Date(resource.created_on), "MMM d, yyyy")
                            : "N/A"}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleDelete(resource.id)}
                            disabled={loading.delete}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            aria-label={`Delete resource ${resource.title}`}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No resources shared yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceShareUpload;
