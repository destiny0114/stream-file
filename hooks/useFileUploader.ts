import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type FileParams = {
  index: number;
  total: number;
  file: string;
  name: string;
};
const uploadFile = async ({ file, index, total, name }: FileParams) => {
  const formData = new FormData();
  formData.append("chunkIndex", index.toString());
  formData.append("totalChunks", total.toString());
  formData.append("chunk", file);
  formData.append("filename", name);

  const response = await axios.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export function useFileUploader() {
  return useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      console.log("Upload successful:", data);
    },
    onError: (error) => {
      console.error("Upload error:", error);
    },
  });
}
