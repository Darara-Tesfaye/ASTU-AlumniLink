import react from "react"
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom"
import Login from './pages/Login'
import RegisterForm from "./components/RegistrationForm"
import LandingPage from "./pages/LandingPage";
// import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";
import ProtectedRoute from "./components/ProtectedRoute";


function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function Registerandlogout(){
  localStorage.clear()
  return <RegisterForm />
  
}
function App() {


  return (
    <BrowserRouter>
      {/* <Header /> */}
    <Routes>
       <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />  
            </ProtectedRoute>
          }
        />
       <Route path="/" element={<LandingPage />} />
       <Route path="/login" element={<Login />} />
       <Route path="/register" element={ <Registerandlogout/>} />
       <Route path="/logout" element={<Logout />} />
       <Route path="*" element = {<NotFound />}/>
       
    </Routes>


    </BrowserRouter>
  )
}

export default App
