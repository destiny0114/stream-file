import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import { chain } from "stream-chain";

import { parser } from "stream-json/Parser";
import { pick } from "stream-json/filters/Pick";
import { streamObject } from "stream-json/streamers/StreamObject";

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

const convertJson = (fileName: string) => {
  const mergedFilePath = process.cwd() + "/merged_files";
  const readStream = fs.createReadStream(`${mergedFilePath}/${fileName}`);
  const pipeline = chain([
    readStream,
    parser(),
    pick({ filter: "trades" }),
    streamObject(),
  ]);
  pipeline.on("data", (data) => {
    const permutations = JSON.parse(data.value);
    //利用这些全部trades来计算东西
    console.log(permutations.trades["BTCUSDT"].length);
  });

  pipeline.on("end", () =>
    console.log(`The End`),
  );
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const chunkIndex = Number(formData.get("chunkIndex"));
  const chunk = String(formData.get("chunk"));
  const totalChunks = Number(formData.get("totalChunks"));
  const fileName = String(formData.get("filename"));

  const chunkDir = process.cwd() + "/chunks";
  const mergedFilePath = process.cwd() + "/merged_files";

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkIndex}`;

  try {
    await fs.promises.writeFile(chunkFilePath, chunk);

    if (chunkIndex === totalChunks - 1) {
      await mergeChunks(fileName, totalChunks);
    }
    convertJson(fileName);
    return NextResponse.json({ message: "Chunk uploaded successfully" });
  } catch (error) {
    console.error("Error saving chunk:", error);
    return NextResponse.json({ error: "Error saving chunk" });
  }
}
