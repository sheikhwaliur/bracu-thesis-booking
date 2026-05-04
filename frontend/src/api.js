import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bracu-thesis-booking.onrender.com/api',
});

export default api;
