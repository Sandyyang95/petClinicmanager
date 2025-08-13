import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5001', // local
  baseURL: 'http://16.176.170.230/api', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
