import axios from 'axios'
import { ACCESS_TOKEN } from './constants.js'

const users_API = axios.create({
    baseURL : import.meta.env.VITE_users_API_URL
});


users_API.interceptors.request.use(
    (config) => {
        const token= localStorage.getItem(ACCESS_TOKEN)
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Authorization Header Set:', config.headers.Authorization);
        }
        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

export default users_API