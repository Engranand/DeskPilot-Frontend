import axiosInstance from "./axiosInstance";

export const getMessagesByTicket = (ticketId) => axiosInstance.get(`/messages/${ticketId}`);