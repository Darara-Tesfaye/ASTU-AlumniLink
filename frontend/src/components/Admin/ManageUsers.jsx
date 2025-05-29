// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import axios from 'axios';
// import { ACCESS_TOKEN } from '../../constants';

// const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://localhost:8000';

// const ManageUsers = () => {
//   const [users, setUsers] = useState([]);
//   const navigate = useNavigate();
//   const accessToken = localStorage.getItem(ACCESS_TOKEN);
//   const location = useLocation();
//   const { user, profile } = location.state || {};

//   console.log(user);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get(`${BASE_URL}/users/user_management/`, {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         });
//         console.log('Fetch users response:', response.data);
//         const sortedUsers = response.data.sort((a, b) => {
//           const isCompanyA = a.usertype.toLowerCase() === 'company';
//           const isCompanyB = b.usertype.toLowerCase() === 'company';
//           const isVerifiedA = a.is_verified;
//           const isVerifiedB = b.is_verified;

//           // Prioritize unverified companies
//           if (isCompanyA && !isVerifiedA && (!isCompanyB || isVerifiedB)) return -1;
//           if (isCompanyB && !isVerifiedB && (!isCompanyA || isVerifiedA)) return 1;

//           // Within groups, sort by joined_date (most recent first)
//           const dateA = new Date(a.joined_date || '1970-01-01');
//           const dateB = new Date(b.joined_date || '1970-01-01');
//           return dateB - dateA;
//         });
//         setUsers(sortedUsers);
//       } catch (error) {
//         toast.error('Failed to fetch users');
//         console.error('Fetch users error:', error);
//       }
//     };
//     fetchUsers();
//   }, [accessToken]);

//   const handleDelete = async (userId) => {
//     if (window.confirm('Are you sure you want to delete this user?')) {
//       try {
//         const response = await axios.delete(`${BASE_URL}/users/delete/${userId}/`, {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         });
//         console.log('Delete response:', response.data);
//         setUsers(users.filter((user) => user.user_id !== userId));
//         toast.success('User deleted successfully');
//       } catch (error) {
//         toast.error('Failed to delete user');
//         console.error('Delete error:', error);
//       }
//     }
//   };

//   const handleVerify = async (userId) => {
//     try {
//       const response = await axios.patch(
//         `${BASE_URL}/users/user_management/${userId}/`,
//         { is_verified: true },
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//       console.log('Verify response:', response.data);
//       setUsers(
//         users.map((user) =>
//           user.user_id === userId ? { ...user, is_verified: true } : user
//         )
//       );
//       toast.success('User verified successfully');
//     } catch (error) {
//       toast.error('Failed to verify user');
//       console.error('Verify error:', error);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4 sm:p-6">
//       <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">User Management</h1>
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white shadow-md rounded-lg">
//           <thead className="bg-gray-200">
//             <tr>
//               <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">Profile</th>
//               <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">Name</th>
//               <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">Email</th>
//               <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">User Type</th>
//               <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">Verified (Company)</th>
//               <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="regform_body">
//             {users.map((user) => (
//               <tr key={user.user_id} className="border-b">
//                 <td className="py-3 px-4">
//                   <img
//                     src={
//                       user.profile.profile_pic ||
//                       user.profile.profile_picture ||
//                       `${BASE_URL}/media/Profile_Picture/default.jpg`
//                     }
//                     alt={`${user.full_name}'s profile`}
//                     className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
//                     onError={(e) => {
//                       e.target.src = `${BASE_URL}/media/Profile_Picture/default.jpg`;
//                     }}
//                   />
//                 </td>
//                 <td className="py-3 px-4 text-sm sm:text-base">{user.full_name}</td>
//                 <td className="py-3 px-4 text-sm sm:text-base">{user.email}</td>
//                 <td className="py-3 px-4 text-sm sm:text-base capitalize">{user.usertype}</td>
//                 <td className="py-3 px-4 text-sm sm:text-base">
//                   {user.usertype.toLowerCase() === 'company' ? (user.is_verified ? 'Yes' : 'No') : '-'}
//                 </td>
//                 <td className="py-3 px-4">
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <button
//                       onClick={() =>
//                         navigate(`/profile/${user.user_id}`, {
//                           state: { user, profile: user.profile },
//                         })
//                       }
//                       className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm sm:text-base"
//                     >
//                       View More
//                     </button>
//                     <button
//                       onClick={() => handleDelete(user.user_id)}
//                       className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm sm:text-base"
//                     >
//                       Delete
//                     </button>
//                     {user.usertype.toLowerCase() === 'company' && !user.is_verified && (
//                       <button
//                         onClick={() => handleVerify(user.user_id)}
//                         className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm sm:text-base"
//                       >
//                         Verify
//                       </button>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// };

// export default ManageUsers;


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ACCESS_TOKEN } from '../../constants';

const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://localhost:8000';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  // const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  const location = useLocation();
  const { user, profile } = location.state || {};
  const currentUser = {user};
  console.log("Current user" ,currentUser);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/users/user_management/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Fetch users response:', response.data);
        const sortedUsers = response.data.sort((a, b) => {
          const isCompanyA = a.usertype.toLowerCase() === 'company';
          const isCompanyB = b.usertype.toLowerCase() === 'company';
          const isVerifiedA = a.is_verified;
          const isVerifiedB = b.is_verified;

          if (isCompanyA && !isVerifiedA && (!isCompanyB || isVerifiedB)) return -1;
          if (isCompanyB && !isVerifiedB && (!isCompanyA || isVerifiedA)) return 1;

          const dateA = new Date(a.joined_date || '1970-01-01');
          const dateB = new Date(b.joined_date || '1970-01-01');
          return dateB - dateA;
        });
        setUsers(sortedUsers);
      } catch (error) {
        toast.error('Failed to fetch users');
        console.error('Fetch users error:', error);
      }
    };

    if (accessToken) {
      fetchUsers();
    }
  }, [accessToken]);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await axios.delete(`${BASE_URL}/users/delete/${userId}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Delete response:', response.data);
        setUsers(users.filter((user) => user.user_id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
        console.error('Delete error:', error);
      }
    }
  };

  const handleVerify = async (userId) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/users/verify-company/${userId}/`,
        { is_verified: true },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      console.log('Verify response:', response.data);
      setUsers(
        users.map((user) =>
          user.user_id === userId ? { ...user, is_verified: true } : user
        )
      );
      toast.success('User verified successfully');
    } catch (error) {
      toast.error('Failed to verify user');
      console.error('Verify error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">User Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">Profile</th>
              <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">Name</th>
              <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">Email</th>
              <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">User Type</th>
              <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">Verified (Company)</th>
              <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="regform_body">
            {users.map((user) => (
              <tr key={user.user_id} className="border-b">
                <td className="py-3 px-4">
                  <img
                    src={
                      user.profile.profile_pic ||
                      user.profile.profile_picture ||
                      `${BASE_URL}/media/Profile_Picture/default.jpg`
                    }
                    alt={`${user.full_name}'s profile`}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `${BASE_URL}/media/Profile_Picture/default.jpg`;
                    }}
                  />
                </td>
                <td className="py-3 px-4 text-sm sm:text-base">{user.full_name}</td>
                <td className="py-3 px-4 text-sm sm:text-base">{user.email}</td>
                <td className="py-3 px-4 text-sm sm:text-base capitalize">{user.usertype}</td>
                <td className="py-3 px-4 text-sm sm:text-base">
                  {user.usertype.toLowerCase() === 'company' ? (user.is_verified ? 'Yes' : 'No') : '-'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() =>
                        navigate(`/profile/${user.user_id}`, {
                          state: { user, profile: user.profile, currentUser },
                        })
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm sm:text-base"
                    >
                      View More
                    </button>
                    <button
                      onClick={() => handleDelete(user.user_id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm sm:text-base"
                    >
                      Delete
                    </button>
                    {user.usertype.toLowerCase() === 'company' && !user.is_verified && (
                      <button
                        onClick={() => handleVerify(user.user_id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm sm:text-base"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ManageUsers;