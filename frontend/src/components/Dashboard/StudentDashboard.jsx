
import React from 'react';
const StudentDashboard = () => {
  
    return (
        <div container mx-auto p-4>
            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4 grid-cols-2">
                <div className="bg-blue-500 p-4 text-white">UpComing Event 4</div>
                <div className="bg-green-500 p-4 text-white">Available Alumni 5</div>
                <div className="bg-red-500 p-4 text-white">Element 3</div>
                <div className="bg-yellow-500 p-4 text-white">Element 4</div>
            </div>
        </div>
    );
};

export default StudentDashboard;