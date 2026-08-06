import axiosInstance from "./axiosInstance";

export const getTickets = (statusFilter) =>
  axiosInstance.get("/tickets", { params: statusFilter ? { status: statusFilter } : {} });

export const getTicketById = (id) => axiosInstance.get(`/tickets/${id}`);
export const createTicket = (data) => axiosInstance.post("/tickets", data);
export const claimTicket = (id) => axiosInstance.patch(`/tickets/${id}/claim`);
export const updateTicket = (id, data) => axiosInstance.patch(`/tickets/${id}`, data);
export const guestLookupTicket = (data) => axiosInstance.post("/tickets/guest/lookup", data);
export const getSuggestedReply = (id) => axiosInstance.get(`/tickets/${id}/suggest-reply`);