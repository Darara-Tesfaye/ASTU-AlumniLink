import React, { useState } from 'react';
import axios from 'axios';
import LoadingIndicator from "./LoadingIndicator";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import forgot_password from "../assets/images/forgot_image.PNG"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSun, faMoon, faRotateForward, faUser } from '@fortawesome/free-solid-svg-icons';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('student');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_users_API_URL;
  const navigate = useNavigate();

  console.log("Base URL:", BASE_URL);
  console.log("Full URL:", `${BASE_URL}/users/forgot-password/`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }


    const requestData = {
      email,
      full_name: fullName,
      user_type: userType,
      new_password: newPassword,
    };

    try {
      const response = await axios.post(`${BASE_URL}/users/forgot-password/`, requestData);
      toast.success(response.data.message);
      setLoading(false);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 dark_body">
      <div className="flex flex-col items-center mb-6 bg-white shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 mt-6">Forgot Password</h1>
        <ToastContainer />
        <div className='flex justify-center sm:flex-row flex-col'>
        <div className="flex justify-center mb-6 sm:block hidden">
            <img
              src={forgot_password}
              alt="Forgot Password"
              width="500"
              height="500"
              className="w-full sm:dispay-none bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"

            />
          </div>

          <form onSubmit={handleSubmit} className='p-6 w-full'>
            <div className="flex items-center relative border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500 mb-4">
              <label className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                Email<span className="text-red-500"> *</span>
              </label>
              <FontAwesomeIcon icon={faEnvelope} className="text-blue-500 mr-2" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"

              />
            </div>
            <div className="flex items-center relative border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500 mb-4">
              <label className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                Full Name<span className="text-red-500"> *</span>
              </label>
              <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"

              />
            </div>
            <div className="flex items-center relative border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500 mb-4">
              <label className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                Select User Type<span className="text-red-500"> *</span>
              </label>
              <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className=" bg-transparent p-3 pr-5.75   focus:border-blue-500 w-full"
              >
                <option value="student">Student</option>
                <option value="company">Company</option>
                <option value="Alumni">Alumni</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="flex items-center relative border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500 mb-4">
              <label className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                New Password<span className="text-red-500"> *</span>
              </label>
              <FontAwesomeIcon icon={faLock} className="text-blue-500 mr-2" />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"

              />
            </div>

            <div className="flex items-center relative border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500 mb-4">
              <label className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                Confirm Password<span className="text-red-500"> *</span>
              </label>
              <FontAwesomeIcon icon={faLock} className="text-blue-500 mr-2" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"

              />
            </div>

            {loading && <LoadingIndicator />}
            <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded">
              Reset Password
            </button>
          </form>
        </div>
        <p className="text-center">
          Remembered your password?{' '}
          <a href="/login" className="text-blue-400 hover:underline"> Log in here</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;