export class VirtualFS {
  private files: Map<string, Buffer>;

  constructor(initialFiles?: Map<string, Buffer>) {
    this.files = initialFiles ? new Map(initialFiles) : new Map();
  }

  setFile(path: string, buffer: Buffer): void {
    this.files.set(this.normalize(path), buffer);
  }

  getFile(path: string): Buffer | null {
    return this.files.get(this.normalize(path)) ?? null;
  }

  exists(path: string): boolean {
    return this.files.has(this.normalize(path));
  }

  listFiles(): string[] {
    return Array.from(this.files.keys());
  }

  toBase64Object(): Record<string, string> {
    const result: Record<string, string> = {};
    this.files.forEach((buf, key) => {
      result[key] = buf.toString('base64');
    });
    return result;
  }

  private normalize(path: string) {
    return path.replace(/\\/g, '/').replace(/^\.\//, '');
  }
}
