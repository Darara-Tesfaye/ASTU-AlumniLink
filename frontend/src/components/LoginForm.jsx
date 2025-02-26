import { useState } from "react";
import users_API from "../users_API"; 
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const res = await users_API.post('/token/', { email, password });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            const usertype = await getUserType();
            console.log(2)

            if (usertype === 'student') {
                navigate('/student/dashboard');
            } else if (usertype === 'Alumni') {
                navigate('/dashboard/alumni');
            } else if (usertype === 'staff') {
                navigate('/dashboard/staff');
            } else if (usertype === 'company') {
                navigate('/dashboard/company');
            } 
        } catch (error) {
            setErrorMessage(error.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const getUserType = async () => {
        try {
            const token = localStorage.getItem(ACCESS_TOKEN);
            const res = await users_API.get('/profile/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        
            return res.data.usertype; 
        } catch (error) {
            console.error('Failed to fetch user type:', error);
            setErrorMessage('Error retrieving user type');
            throw error; 
        }
    };


    return (
        <form onSubmit={handleSubmit} className="login-form-container">
            <h1>Login</h1>
            <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            {loading && <LoadingIndicator />}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button className="form-button" type="submit">
                Login
            </button>
        </form>
    );
}

export default LoginForm;