import axios from 'axios';

export default function index() {
    const enviroment = process.env.NEXT_PUBLIC_ENV; 
    return axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: enviroment === 'PROD' ? true :false, 
        headers: {
        'Content-Type': 'application/json',
        },
    });
}
