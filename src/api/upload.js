

import axiosInstance from "./axiosInstance";

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};