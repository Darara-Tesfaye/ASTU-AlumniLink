import React, { useState } from "react";
import Navbar from "../../Components/Navbar";
import Sidebar from "./Sidebar";

const Profile = () => {
  const [adminData, setAdminData] = useState({
    fullName: "Admin User",
    email: "admin@astualumnilink.com",
    role: "Administrator",
    phone: "123-456-7890",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (adminData.password !== adminData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    setMessage("Profile updated successfully!");
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">Admin Profile</h1>

        <form className="bg-white p-6 rounded-lg shadow-md space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium">Full Name</label>
            <input 
              type="text" 
              name="fullName" 
              value={adminData.fullName} 
              onChange={handleChange} 
              className="w-full p-3 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input 
              type="email" 
              name="email" 
              value={adminData.email} 
              onChange={handleChange} 
              className="w-full p-3 border rounded-md" 
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Role</label>
            <input 
              type="text" 
              name="role" 
              value={adminData.role} 
              className="w-full p-3 border rounded-md bg-gray-200 cursor-not-allowed" 
              readOnly
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Phone Number</label>
            <input 
              type="text" 
              name="phone" 
              value={adminData.phone} 
              onChange={handleChange} 
              className="w-full p-3 border rounded-md" 
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">New Password</label>
            <input 
              type="password" 
              name="password" 
              onChange={handleChange} 
              className="w-full p-3 border rounded-md" 
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              onChange={handleChange} 
              className="w-full p-3 border rounded-md" 
            />
          </div>

          {message && <p className="text-center text-green-600">{message}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
