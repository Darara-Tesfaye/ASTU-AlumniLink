import React, { useState } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import UserManagement from '../UserManagement'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };



    return (
        <div className="flex flex-col h-screen">
            <Header toggleSidebar={toggleSidebar} />
            <div className="flex flex-1">
                <div className={`hidden md:block ${isSidebarOpen ? 'block' : 'hidden'}`}>
                    <Sidebar />
                </div>
                <div className={`md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
                    <Sidebar />
                </div>
               


                <main className={`flex-1 p-4 overflow-auto bg-white main_Dashboard ${isSidebarOpen ? 'pl-64' : ''}`}>
               
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;