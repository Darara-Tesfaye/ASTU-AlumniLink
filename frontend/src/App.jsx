import react from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Login from './pages/Login'
import RegisterForm from "./components/RegistrationForm"
import LandingPage from "./pages/LandingPage";
// import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState } from "react";

import Dashboard from './components/Dashboard/Dashboard'
import DashboardLayout from './components/Dashboard/DashboardLayout';
// import StudentDashboard from "./components/Dashboard/StudentDashboard";


function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function Registerandlogout() {
  localStorage.clear()
  return <RegisterForm />

}
function App() {
  
  return (
    <BrowserRouter>
   
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registerandlogout />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />

      </Routes>


    </BrowserRouter>
  )
}

export default App
