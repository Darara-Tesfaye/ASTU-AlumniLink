import React, { useState } from "react";
import Navbar from "../../Components/Navbar";
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaBuilding, FaBriefcase, FaUserClock } from "react-icons/fa";
import Sidebar from "./Sidebar";

const Status = () => {
  const [userStats, setUserStats] = useState({
    students: 500,
    faculty: 120,
    alumni: 400,
    companies: 180,
    employedAlumni: 280,
    unemployedAlumni: 120,
  });

  return (
     <div className="bg-gray-100 min-h-screen">
<Sidebar/>
<div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">
          User Status & Statistics
        </h1>

        {/* User Statistics Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <FaUserGraduate className="text-blue-700 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Total Students</h2>
              <p className="text-2xl font-bold">{userStats.students}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <FaChalkboardTeacher className="text-green-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Total Faculty</h2>
              <p className="text-2xl font-bold">{userStats.faculty}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <FaUsers className="text-purple-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Total Alumni</h2>
              <p className="text-2xl font-bold">{userStats.alumni}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <FaBuilding className="text-orange-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Total Companies</h2>
              <p className="text-2xl font-bold">{userStats.companies}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <FaBriefcase className="text-green-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Employed Alumni</h2>
              <p className="text-2xl font-bold">{userStats.employedAlumni}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <FaUserClock className="text-red-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Unemployed Alumni</h2>
              <p className="text-2xl font-bold">{userStats.unemployedAlumni}</p>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Manage User Data</h2>
          <p className="text-gray-600">Admins can review and update user statistics.</p>
        </div>
      </div>
    </div>
  );
};

export default Status;
