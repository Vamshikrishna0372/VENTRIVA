const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const env = require('../config/env');
const logger = require('../services/loggerService');

const runDocumentCleanupJob = async () => {
  try {
    const isDryRun = env.DRY_RUN_CLEANUP;
    const uploadDir = path.resolve(env.UPLOAD_DIR || './storage/uploads');

    if (!fs.existsSync(uploadDir)) {
      return { orphanedFiles: [], isDryRun };
    }

    const physicalFiles = fs.readdirSync(uploadDir);
    const activeDocs = await Document.find({}).select('storagePath').lean();
    const activePaths = new Set(activeDocs.map((d) => path.basename(d.storagePath)));

    const orphanedFiles = [];
    for (const file of physicalFiles) {
      if (!activePaths.has(file)) {
        orphanedFiles.push(file);
      }
    }

    if (!isDryRun && orphanedFiles.length > 0) {
      for (const file of orphanedFiles) {
        const filePath = path.join(uploadDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          // Silent
        }
      }
      logger.info(`[Document Cleanup Job] Removed ${orphanedFiles.length} orphaned files from storage.`);
    } else {
      logger.info(`[Document Cleanup Job] (DRY_RUN=${isDryRun}) Detected ${orphanedFiles.length} orphaned storage files.`);
    }

    return { orphanedCount: orphanedFiles.length, orphanedFiles, isDryRun };
  } catch (error) {
    logger.error('[Document Cleanup Job Error]', { error: error.message });
    throw error;
  }
};

module.exports = runDocumentCleanupJob;
