import axios from 'axios';

export default function index() {
    return axios.create({
        baseURL: process.env.API_URL,
        headers: {
        'Content-Type': 'application/json',
        },
    });
}
