import axiosInstance from "./axiosInstance";

export const getAgents = () => axiosInstance.get("/users/agents");
export const createUser = (data) => axiosInstance.post("/users", data);