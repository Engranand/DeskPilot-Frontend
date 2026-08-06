import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const createGuestTicket = (data) => axios.post(`${API_URL}/tickets/guest`, data);
const widgetBaseUrl = "https://desk-pilot-frontend.vercel.app";