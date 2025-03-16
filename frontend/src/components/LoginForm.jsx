// import { useState } from "react";
// import users_API from "../users_API";
// import { useNavigate } from "react-router-dom";
// import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
// import "../styles/Form.css";
// import LoadingIndicator from "./LoadingIndicator";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEnvelope, faLock, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';


// function LoginForm() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [errorMessage, setErrorMessage] = useState("");
//     const [isDarkMode, setIsDarkMode] = useState(false);

//     const navigate = useNavigate();
//     const toggleTheme = () => {
//         setIsDarkMode(!isDarkMode);
//         document.body.classList.toggle('dark', !isDarkMode);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setErrorMessage("");

//         try {
//             const res = await users_API.post('/users/token/', { email, password });
//             console.log("Full response:", response);
//             localStorage.setItem(ACCESS_TOKEN, res.data.access);
//             localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
//             const {  user } = res.data;
//             localStorage.setItem('user', JSON.stringify(user));
//             console.log("User data:", user);
//             // const usertype = await getUserType();
//             // if (usertype === 'student') {
//             //     // navigate('/student/dashboard');
//             //     navigate('/student/dashboard', { state: { usertype } });
//             // } else if (usertype === 'Alumni') {
//             //     navigate('/dashboard/alumni');
//             // } else if (usertype === 'staff') {
//             //     navigate('/dashboard/staff');
//             // } else if (usertype === 'company') {
//             //     navigate('/dashboard/company');
//             // }
//         } catch (error) {
//             setErrorMessage(error.response?.data?.detail || 'Login failed. Please check your credentials.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getUserType = async () => {
//         try {
//             const token = localStorage.getItem(ACCESS_TOKEN);
//             const res = await users_API.get('/users/login/', {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             return res.data.usertype;
//         } catch (error) {
//             console.error('Failed to fetch user type:', error);
//             setErrorMessage('Error retrieving user type');
//             throw error;
//         }
//     };


//     return (

//         <div className="min-h-screen flex flex-col md:justify-center aligns-center md:p-10 px-6 my-20">

//             <button
//                 onClick={toggleTheme}
//                 className="py-2 px-3 h-10 md:w-1/3 lg:w-1/4 w-1/2  border rounded-md bg-transparent dark:bg-gray-800 text-neutral-1000 dark:text-blue transition duration-300 float-right"
//             >
//                 <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="mr-2" />
//                 {isDarkMode ? 'Light Mode' : 'Dark Mode'}
//             </button>
//             <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center mx-auto h-100 py-5 rounded-lg shadow-md md:w-[700px] md:my-40 md:mt-10 bg-white w-full login_form">
//                 <h1 className="text-3xl sm:text-6xl lg:text-5xl text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text md:mt-16 mt-1">
//                     Log In
//                 </h1>
//                 <div
//                     className="underline"
//                     style={{
//                         left: '0',
//                         alignItems: 'center',
//                         width: '30%',
//                         color: 'orange',
//                         marginTop: '1rem',
//                         borderBottom: '2px solid orange',
//                         transform: 'translateX(10%)',
//                     }}
//                 ></div>
//                 <div className="grid grid-cols-1 gap-8 w-full md:px-20 px-4 md:my-14 my-8">
//                     <div className="w-full relative">
//                         <label htmlFor="email" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
//                             Email<span className="text-red-500"> *</span>
//                         </label>
//                         <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

//                             <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 mr-2" />
//                             <input

//                                 className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none" type="email"
//                                 name="email"
//                                 id="email"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 required
//                             />
//                         </div>
//                     </div>
//                     <div className="w-full relative">
//                         <label htmlFor="full_name" className="absolute inline-block px-2.5 m-0 top-0 left-3 bg-white transform -translate-y-1/2 text-xs font-normal leading-4 text-gray-500 z-10">
//                             Password<span className="text-red-500"> *</span>
//                         </label>

//                         <div className="flex items-center border border-gray-200  rounded-lg rounded pl-4 hover:border-blue-500 focus:border-blue-500">

//                             <FontAwesomeIcon icon={faLock} className="text-gray-500 mr-2" />
//                             <input
//                                 className="w-full bg-transparent p-3 pr-5.75 border-none outline-none rounded-lg text-sm font-medium leading-6 shadow-none"
//                                 type="password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 placeholder="Password"
//                                 required
//                             />
//                         </div>
//                     </div>
//                 </div>


//                 {loading && <LoadingIndicator />}
//                 {errorMessage && <div className="text-white bg-red-500 text-center md:m-4 m-2 mx-10 h-10 p-2">{errorMessage}</div>}
//                 <button className="float-right w-6/12 p-2.5 my-5 bg-blue-500 text-white border-none rounded-md cursor-pointer transition duration-200 ease-in-out hover:bg-blue-600" type="submit">
//                     LOGIN
//                 </button>
//             </form>
//         </div>
//     );
// }


// export default LoginForm;
import { useState } from "react";
import users_API from "../users_API";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

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
            
            navigate('/dashboard', { state: { user, profile } });
    
        } catch (error) {
            setErrorMessage(error.response?.data?.detail || 'Login failed. Please check your credentials.');
            console.error("Error response:", error.response); 
        } finally {
            setLoading(false);
        }
    };
    

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);
    //     setErrorMessage("");
        
    //     try {
            
    //         const response = await users_API.post('/users/login/', { email, password });
    //         localStorage.setItem(ACCESS_TOKEN, response.data.access);
    //         localStorage.setItem(REFRESH_TOKEN, response.data.refresh);

    //         const { user } = response.data; 

    //         localStorage.setItem('user', JSON.stringify(user));

    //         const usertype = user.usertype

    //         // if (usertype === 'student') {
    //         navigate('/dashboard', { state: { user } });
          
    //     } catch (error) {
    //         setErrorMessage(error.response?.data?.detail || 'Login failed. Please check your credentials.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    return (
        <div className="min-h-screen flex flex-col md:justify-center aligns-center md:p-10 px-6 my-20">
            <button
                onClick={toggleTheme}
                className="py-2 px-3 h-10 md:w-1/3 lg:w-1/4 w-1/2 border rounded-md bg-transparent dark:bg-gray-800 text-neutral-1000 dark:text-blue transition duration-300 float-right"
            >
                <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="mr-2" />
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center mx-auto h-100 py-5 rounded-lg shadow-md md:w-[700px] md:my-40 md:mt-10 bg-white w-full login_form">
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
            </form>
        </div>
    );
}

export default LoginForm;