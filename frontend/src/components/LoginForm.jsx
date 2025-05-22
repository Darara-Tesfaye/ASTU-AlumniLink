import { useState } from "react";
import users_API from "../users_API";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSun, faMoon, faRotateForward } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);

    const navigate = useNavigate();
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark', !isDarkMode);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await users_API.post('/users/login/', { email, password });
            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            const { user, profile } = response.data;

            localStorage.setItem('user', JSON.stringify(user));

            const usertype = user.usertype;

            if (usertype === 'Admin') {
                navigate('/admindashboard', { state: { user, profile } });
            } else {
console.log("User", user);
console.log("Profile", profile);
                navigate('/dashboard', { state: { user, profile } });
            }

        } catch (error) {
            setErrorMessage(error.response?.data?.detail || 'Login failed. Please check your credentials.');
            console.error("Error response:", error.response);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:justify-center aligns-center md:p-10 px-6 my-20">
            <div className="mx-auto h-100 py-5 rounded-lg shadow-md md:w-[700px] md:my-40 md:mt-10 bg-white w-full login_form bg-white pb-0">
                <button
                    onClick={toggleTheme}
                    className="py-2 px-3 h-10 md:w-1/3 lg:w-1/4 w-1/2 border rounded-md bg-transparent dark:bg-gray-800 text-neutral-1000 dark:text-blue transition duration-300 float-left ml-10"
                >
                    <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="mr-2" />
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>

                <Link to="/logout">
                    <FontAwesomeIcon icon={faRotateForward} className="text-gray-500 float-right mr-10" />
                </Link>
                <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center mx-auto h-100 py-5 rounded-lg shadow-md md:w-[700px] md:my-40 md:mb-0 md:mt-10 bg-white w-full login_form">

                    <h1 className="text-3xl sm:text-6xl lg:text-5xl text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text md:mt-16 mt-1">
                        Log In
                    </h1>
                    <div
                        className="underline"
                        style={{
                            left: '0',
                            alignItems: 'center',
                            width: '30%',
                            color: 'orange',
                            marginTop: '1rem',
                            borderBottom: '2px solid orange',
                            transform: 'translateX(10%)',
                        }}
                    ></div>
                    <div className="grid grid-cols-1 gap-8 w-full md:px-20 px-4 md:my-14 my-8">
                        <div className="w-full relative">
                            <label htmlFor="email" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                Email<span className="text-red-500"> *</span>
                            </label>
                            <div className="flex items-center border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 mr-2" />
                                <input
                                    className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-full relative">
                            <label htmlFor="password" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
                                Password<span className="text-red-500"> *</span>
                            </label>
                            <div className="flex items-center border border-gray-200 rounded-lg pl-4 hover:border-blue-500 focus:border-blue-500">
                                <FontAwesomeIcon icon={faLock} className="text-gray-500 mr-2" />
                                <input
                                    className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {loading && <LoadingIndicator />}
                    {errorMessage && <div className="text-white bg-red-500 text-center md:m-4 m-2 mx-10 h-10 p-2">{errorMessage}</div>}
                    <button className="float-right w-6/12 p-2.5 my-5 bg-blue-500 text-white border-none rounded-md cursor-pointer transition duration-200 ease-in-out hover:bg-blue-600" type="submit">
                        LOGIN
                    </button>
                    <div className="flex sm:gap-64 gap-16">
                        
                    <p className="text-center">
                        Haven't account yet?
                        <a href="/register" className="text-blue-400 hover:underline"> Register in here</a>
                    </p>
                    <p className="text-center margin-right">
                      <a href="/forgotpassword" className="text-blue-400 hover:underline"> Forget Password</a>
                    </p>

                    </div>


                </form>

            </div>

        </div>
    );
}

export default LoginForm;