const fs = require('fs');
const path = require('path');
const { crypto } = require('crypto');
const v4 = require('crypto').randomUUID || (() => Math.random().toString(36).substring(2) + Date.now().toString(36));

const UPLOADS_DIR = path.resolve(__dirname, '../storage/uploads');

// Ensure storage directory exists synchronously
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Storage Service Abstraction Layer
 */
const storageService = {
  /**
   * Upload file buffer to local storage
   */
  async uploadFile(fileBuffer, originalName, mimeType) {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new Error('Invalid file buffer provided for upload');
    }

    const ext = path.extname(originalName).toLowerCase().replace('.', '') || 'bin';
    const uniqueId = typeof v4 === 'function' ? v4() : Math.random().toString(36).substring(2, 10);
    const storageKey = `${Date.now()}-${uniqueId}.${ext}`;
    const targetPath = path.join(UPLOADS_DIR, storageKey);

    // Prevent path traversal
    if (!targetPath.startsWith(UPLOADS_DIR)) {
      throw new Error('Invalid storage key path traversal attempt');
    }

    await fs.promises.writeFile(targetPath, fileBuffer);

    return {
      storageKey,
      storageProvider: 'local',
      fileSize: fileBuffer.length,
    };
  },

  /**
   * Get readable file stream for secure downloading
   */
  downloadFileStream(storageKey) {
    const safeKey = path.basename(storageKey);
    const targetPath = path.join(UPLOADS_DIR, safeKey);

    if (!targetPath.startsWith(UPLOADS_DIR)) {
      throw new Error('Security Violation: Invalid file path traversal');
    }

    if (!fs.existsSync(targetPath)) {
      throw new Error('File not found in storage');
    }

    return fs.createReadStream(targetPath);
  },

  /**
   * Delete file from storage
   */
  async deleteFile(storageKey) {
    try {
      const safeKey = path.basename(storageKey);
      const targetPath = path.join(UPLOADS_DIR, safeKey);
      if (targetPath.startsWith(UPLOADS_DIR) && fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath);
      }
    } catch (err) {
      console.error('Storage file deletion error:', err);
    }
  },

  /**
   * Check if file exists in storage
   */
  fileExists(storageKey) {
    const safeKey = path.basename(storageKey);
    const targetPath = path.join(UPLOADS_DIR, safeKey);
    return targetPath.startsWith(UPLOADS_DIR) && fs.existsSync(targetPath);
  },
};

module.exports = storageService;
