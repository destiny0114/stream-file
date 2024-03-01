import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
const mergeChunks = async (fileName: string, totalChunks: number) => {
  const chunkDir = process.cwd() + "/chunks";
  const mergedFilePath = process.cwd() + "/merged_files";

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }

  const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);

  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
    const chunkBuffer = await fs.promises.readFile(chunkFilePath);
    writeStream.write(chunkBuffer);
    fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
  }

  writeStream.end();
  console.log("Chunks merged successfully");
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const chunkIndex = Number(formData.get("chunkIndex"));
  const chunk = String(formData.get("chunk"));
  const totalChunks = Number(formData.get("totalChunks"));
  const fileName = String(formData.get("filename"));

  const chunkDir = process.cwd() + "/chunks";

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkIndex}`;

  try {
    await fs.writeFileSync(chunkFilePath, chunk);

    if (chunkIndex === totalChunks - 1) {
      await mergeChunks(fileName, totalChunks);
    }

    return NextResponse.json({ message: "Chunk uploaded successfully" });
  } catch (error) {
    console.error("Error saving chunk:", error);
    return NextResponse.json({ error: "Error saving chunk" });
  }
}
