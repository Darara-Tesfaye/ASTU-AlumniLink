// import React, { useState } from 'react';
// import UserSearch from './User_Search';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { ACCESS_TOKEN } from '../constants';

// const UserManagement = () => {
//     const [users, setUsers] = useState([]);
//     const [connectionStatuses, setConnectionStatuses] = useState({});
//     const BASE_URL = import.meta.env.VITE_users_API_URL;
//         const accessToken = localStorage.getItem(ACCESS_TOKEN);

//     const fetchConnectionStatus = async (selectedUsers) => {
//         const requesteeIds = selectedUsers.map(user => user.id); 

//         if (requesteeIds.length > 0) {
//             try {
//                 const accessToken = localStorage.getItem('ACCESS_TOKEN'); 
//                 const response = await axios.get(`${BASE_URL}/users/connections/status/`, {
//                     params: { requestee_id: requesteeIds }, 
//                     headers: {
//                         'Authorization': `Bearer ${accessToken}`
//                     }
//                 });

//                 // Assuming response is in the format { userId1: { status: 'active' }, userId2: { status: 'pending' } }
//                 setConnectionStatuses(response.data); // Store connection statuses in the state
//             } catch (error) {
//                 console.error('Error fetching connection statuses:', error.response ? error.response.data : error.message);
//                 toast.error('Failed to fetch connection statuses.');
//             }
//         }
//     };

//     const handleSearch = (filteredUsers) => {
//         setUsers(filteredUsers);
//         setConnectionStatuses({}); 
//     };

//     const handleFetchConnectionStatus = (selectedUsers) => {
//         fetchConnectionStatus(selectedUsers); 
//     };

//     return (
//         <div>
//             <UserSearch onSearch={handleSearch} />
//             <div>
//                 {users.length > 0 ? (
//                     <div>
//                         <h3>Selected Users</h3>
//                         {users.map(user => (
//                             <div key={user.id}>
//                                 <p>User ID: {user.id} - {user.full_name} - {user.email}</p>
//                                 <p>Status: {user.is_active ? 'Active' : 'Inactive'}</p>
//                                 <p>User Type: {user.usertype}</p>
//                                 <p>Joined Date: {new Date(user.joined_date).toLocaleDateString()}</p>
//                                 <p>Last Login: {new Date(user.last_login).toLocaleDateString()}</p>
//                                 <p>Superuser: {user.is_superuser ? 'Yes' : 'No'}</p>
//                                 <p>Areas of Interest: {user.areas_of_interest ? user.areas_of_interest.join(', ') : 'None'}</p>
//                                 <p>
//                                     Connection Status: 
//                                     {connectionStatuses[user.id] ? connectionStatuses[user.id].status : 'Unknown'}
//                                 </p>
//                             </div>
//                         ))}
//                         <button onClick={() => handleFetchConnectionStatus(users)} disabled={users.length === 0}>
//                             Fetch Connection Statuses
//                         </button>
//                     </div>
//                 ) : (
//                     <p>No users found or selected.</p>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default UserManagement;

import React, { useState } from 'react';
import UserSearch from './User_Search';

const UserManagement = () => {
    const [users, setUsers] = useState([]);

    const handleSearch = (filteredUsers) => {
        setUsers(filteredUsers); 
    };

    return (
          <div>
            <UserSearch onSearch={handleSearch} />
            <div>
                {users.map(user => (
                    <div key={user.email}>
                        <p>{user.full_name} - {user.email}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};   

export default UserManagement;