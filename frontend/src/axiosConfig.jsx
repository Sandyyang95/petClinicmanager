import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5001', // local
  baseURL: 'http://54.66.39.55/api', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
