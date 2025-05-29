import Header from "../Header";
import Sidebar from "../Sidebar";
import React, { useState } from 'react';

const EventsLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };


return (
    <div className="flex flex-col h-screen">
    <Header toggleSidebar={toggleSidebar} />
    <div className="flex flex-1 lg:grid lg:grid-cols-12">
        <div className={`hidden md:block col-span-2  ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <Sidebar />
        </div>
        <div className={`md:hidden  col-span-2  ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <Sidebar />
        </div>              
        <main className={`flex-1 md:p-4 overflow-auto col-span-10 pt-20  mt-8 ${isSidebarOpen ? 'pl-64' : ''}`}>               
            {children}
        </main>
    </div>
</div>
);
};


export default EventsLayout;