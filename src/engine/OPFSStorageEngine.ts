/**
 * Origin Private File System (OPFS) High-Performance Media Storage Engine
 * Replaces memory Blobs with high-speed virtual disk streams via navigator.storage.getDirectory()
 * Eliminates browser memory crashes on large projects.
 */
export class OPFSStorageEngine {
  private static rootDir: FileSystemDirectoryHandle | null = null;

  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage;
  }

  private static async getRoot(): Promise<FileSystemDirectoryHandle | null> {
    if (!this.rootDir && this.isSupported()) {
      this.rootDir = await navigator.storage.getDirectory();
    }
    return this.rootDir;
  }

  /**
   * Saves a file chunk-by-chunk to the private virtual disk without loading into RAM
   */
  static async saveFile(fileName: string, file: File): Promise<string> {
    const root = await this.getRoot();
    if (!root) {
      // Fallback to standard object URL
      return URL.createObjectURL(file);
    }

    try {
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileHandle = await root.getFileHandle(sanitizedName, { create: true });
      const writable = await fileHandle.createWritable();

      // Stream file directly to OPFS virtual disk
      const reader = file.stream().getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writable.write(value);
      }
      await writable.close();

      return `opfs://${sanitizedName}`;
    } catch {
      return URL.createObjectURL(file);
    }
  }

  /**
   * Retrieves a streamable File from OPFS
   */
  static async getFile(opfsPath: string): Promise<File | null> {
    const root = await this.getRoot();
    if (!root) return null;

    try {
      const fileName = opfsPath.replace('opfs://', '');
      const fileHandle = await root.getFileHandle(fileName);
      return await fileHandle.getFile();
    } catch {
      return null;
    }
  }
}
