"use client";
import { Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ChangeEvent, useState } from "react";
import { FileStreamer } from "@/libs/FileStreamer";
import { useFileUploader } from "@/hooks/useFileUploader";
import Progress from "@/components/Progress";

export default function Home() {
  const fileMutation = useFileUploader();
  const [progress, setProgress] = useState(0);
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files && files.length > 0) {
      let currentFile = files[0];
      const fileStreamer = new FileStreamer(currentFile);
      let chunkNumber = 0;
      let totalChunks = fileStreamer.getTotalChunks();

      while (!fileStreamer.isEndOfFile()) {
        let chunk = await fileStreamer.readBlockAsText();
        await fileMutation.mutateAsync({
          index: chunkNumber,
          total: totalChunks,
          file: chunk,
          name: currentFile.name,
        });
        setProgress(Math.ceil(Number((chunkNumber + 1) / totalChunks) * 100));
        chunkNumber++;
      }
    }
  };

  return (
    <main className="h-screen w-screen flex items-center justify-center">
      {fileMutation.isIdle && (
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload file
          <input type="file" onChange={onFileChange} hidden />
        </Button>
      )}
      {progress > 0 && <Progress value={progress} />}
    </main>
  );
}
