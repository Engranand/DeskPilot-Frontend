import axiosInstance from "./axiosInstance";

export const getAgents = () => axiosInstance.get("/users/agents");