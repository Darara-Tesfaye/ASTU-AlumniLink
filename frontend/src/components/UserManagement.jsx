import React, { useState } from 'react';
import UserSearch from './User_Search';

const UserManagement = () => {
    const [users, setUsers] = useState([]);

    const handleSearch = (filteredUsers) => {
        setUsers(filteredUsers); // Update state with the filtered users
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