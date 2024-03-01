export class FileStreamer {
  private file: File;
  private textDecoder: TextDecoder;
  private offset: number = 0;
  private chunkSize: number = 50 * Math.pow(1024, 2); // bytes

  public constructor(inputFile: File, encoding = "utf-8") {
    this.file = inputFile;
    this.textDecoder = new TextDecoder(encoding);
    this.reset();
  }

  private reset() {
    this.offset = 0;
  }

  private async eventPromise(
    target: EventTarget,
    eventName: string,
  ): Promise<Event> {
    return new Promise<Event>((resolve) => {
      const handleEvent = (event: Event) => {
        resolve(event);
      };

      target.addEventListener(eventName, handleEvent as EventListener);
    });
  }
  private async readFile(blob: Blob): Promise<ArrayBuffer> {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(blob);

    const event = await this.eventPromise(fileReader, "loadend");
    const target = event.target as FileReader;
    if (target.error) {
      throw target.error;
    }
    return target.result as ArrayBuffer;
  }

  public async readBlockAsText(length = this.chunkSize): Promise<string> {
    if (this.offset >= this.file.size) {
      return "";
    }

    const blob = this.file.slice(this.offset, this.offset + length);
    const buffer = await this.readFile(blob);
    const decodedText = this.textDecoder.decode(buffer, { stream: true });
    this.offset += length;

    if (this.offset >= this.file.size) {
      const finalText = this.textDecoder.decode();
      return decodedText + finalText;
    }
    return decodedText;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  }
  public isEndOfFile() {
    return this.offset >= this.file.size;
  }

  public getOffSet() {
    return this.offset;
  }

  public getFileSize() {
    return this.file.size;
  }

  public getTotalChunks() {
    return Math.ceil(this.file.size / this.chunkSize);
  }
}
