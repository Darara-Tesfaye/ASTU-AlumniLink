import React, { useEffect, useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faBriefcase, faUserGraduate, faChalkboardTeacher, faBuilding } from '@fortawesome/free-solid-svg-icons';

const MoreStatus = () => {
  const BASE_URL = import.meta.env.VITE_users_API_URL;
  const [userStats, setUserStats] = useState({
    students: 0,
    staff: 0,
    alumni: 0,
    companies: 0,
    employedAlumni: 0,
    unemployedAlumni: 0,
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/usercounts/`);
        if (!response.ok) {
          throw new Error('Failed to fetch your Profile');
      }
        console.log(`${BASE_URL}/users/user_counts/`);
        const data = await response.json();
        console.log(data);
        setUserStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchUserStats();
  }, []);

  const barData = [
    { name: "Students", value: userStats.students },
    { name: "Faculty", value: userStats.staff},
    { name: "Alumni", value: userStats.alumni },
    { name: "Companies", value: userStats.companies },
  ];

  const pieData = [
    { name: "Employed Alumni", value: userStats.employedAlumni },
    { name: "Unemployed Alumni", value: userStats.unemployedAlumni },
  ];

  const COLORS = ["#4CAF50", "#FF5733"];

  return (
    <div className="bg-gray-100 min-h-screen more-status-bg">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-600  text-center mb-6">User Status & Statistics</h1>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 user-status-content">
            <FontAwesomeIcon icon={faUserGraduate} className="text-gray-500 mr-2" />
            <div>
              <h2 className="text-xl font-semibold text-gray-500">Total Students</h2>
              <p className="text-2xl font-bold">{userStats.students}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 user-status-content">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="text-green-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-500">Total Faculty</h2>
              <p className="text-2xl font-bold">{userStats.staff}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 user-status-content">
            <FontAwesomeIcon icon={faUsers} className="text-purple-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-500">Total Alumni</h2>
              <p className="text-2xl font-bold">{userStats.alumni}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 user-status-content">
            <FontAwesomeIcon icon={faBuilding} className="text-orange-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-500">Total Companies</h2>
              <p className="text-2xl font-bold">{userStats.companies}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md user-status-content">
            <h2 className="text-xl font-semibold text-gray-500 mb-4">User Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#007BFF" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md user-status-content">
            <h2 className="text-xl font-semibold text-gray-500 mb-4">Alumni Employment Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreStatus;