import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { DOCUMENT_CATEGORIES, DOCUMENT_VISIBILITY, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from '../../utils/documentConstants';
import { uploadDocument, uploadDocumentVersion } from '../../services/documentService';

export const DocumentUploadModal = ({ startupId, documentToVersion = null, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DOCUMENT_CATEGORIES[0]);
  const [visibility, setVisibility] = useState('Investors Only');
  const [description, setDescription] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [changeNote, setChangeNote] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileSelect = (e) => {
    setErrorMsg(null);
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMsg(`File format .${ext} is strictly prohibited. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg('File size exceeds the 25 MB limit.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    if (!title && !documentToVersion) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (documentToVersion) {
        formData.append('changeNote', changeNote.trim() || 'New version upload');
        const res = await uploadDocumentVersion(documentToVersion._id, formData);
        if (res?.success) {
          onSuccess(res.document);
          onClose();
        }
      } else {
        formData.append('startupId', startupId);
        formData.append('category', category);
        formData.append('title', title.trim() || file.name);
        formData.append('description', description.trim());
        formData.append('visibility', visibility);
        formData.append('isPrimary', isPrimary);

        const res = await uploadDocument(formData);
        if (res?.success) {
          onSuccess(res.document);
          onClose();
        }
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-400" />
            <h3 className="text-lg font-bold text-slate-100">
              {documentToVersion ? `Upload Version ${documentToVersion.version + 1}` : 'Upload Document to Data Room'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* File Picker */}
          <div className="border-2 border-dashed border-slate-800 hover:border-brand-500/50 rounded-2xl p-6 text-center space-y-2 bg-slate-950/50 transition-all cursor-pointer">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
              <Upload className="w-8 h-8 text-brand-400 mx-auto" />
              {file ? (
                <div>
                  <p className="text-xs font-bold text-slate-100">{file.name}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-200">Click or Drag & Drop File</p>
                  <p className="text-[10px] text-slate-400">PDF, PPT, DOC, XLS, PNG, JPG (Max 25 MB)</p>
                </div>
              )}
            </label>
          </div>

          {!documentToVersion ? (
            <>
              <Input
                label="Document Title"
                placeholder="e.g. Q3 2026 Pitch Deck"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
                <Select
                  label="Visibility Level"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  options={DOCUMENT_VISIBILITY.map((v) => ({ value: v, label: v }))}
                />
              </div>

              {category === 'Pitch Deck' && (
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="rounded border-slate-800 text-brand-500 focus:ring-brand-500"
                  />
                  <span>Mark as Primary Startup Pitch Deck</span>
                </label>
              )}
            </>
          ) : (
            <Input
              label="Version Change Note"
              placeholder="e.g. Updated financial projections slide..."
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
            />
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isUploading}>
              Upload File
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DocumentUploadModal;
