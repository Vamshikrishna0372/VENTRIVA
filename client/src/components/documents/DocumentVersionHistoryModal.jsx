import React, { useState, useEffect } from 'react';
import { History, X, Download, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { getDocumentVersions, downloadDocumentBlob } from '../../services/documentService';
import { formatFileSize } from '../../utils/documentConstants';

export const DocumentVersionHistoryModal = ({ document, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [document]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const res = await getDocumentVersions(document._id);
      if (res?.success && Array.isArray(res.versions)) {
        setVersions(res.versions);
      }
    } catch (err) {
      console.error('Error fetching version history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await downloadDocumentBlob(docId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download document version');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-400" />
            <h3 className="text-lg font-bold text-slate-100">Version History: {document.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No historical versions recorded.</p>
          ) : (
            versions.map((ver) => (
              <div key={ver._id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={ver.versionNumber === document.version ? 'emerald' : 'slate'} size="xs">
                      v{ver.versionNumber} {ver.versionNumber === document.version && '(Current)'}
                    </Badge>
                    <span className="font-bold text-slate-200">{ver.originalFileName}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {formatFileSize(ver.fileSize)} • {new Date(ver.createdAt).toLocaleDateString()}
                  </p>
                  {ver.changeNote && <p className="text-[11px] text-slate-300 italic">"{ver.changeNote}"</p>}
                </div>

                <Button variant="ghost" size="sm" icon={Download} onClick={() => handleDownload(document._id, ver.originalFileName)} />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default DocumentVersionHistoryModal;
