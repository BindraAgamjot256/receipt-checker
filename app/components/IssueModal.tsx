import { useState, useMemo } from 'react';
import { Receipt } from '../types';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentName: string, section: string) => void;
  receiptId: number | null;
  allReceipts: Receipt[];
}

export default function IssueModal({ isOpen, onClose, onSubmit, receiptId, allReceipts }: IssueModalProps) {
  const [studentName, setStudentName] = useState('');
  const [section, setSection] = useState('XII-A');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Check for duplicates using useMemo instead of useEffect
  const duplicateReceipt = useMemo(() => {
    if (!studentName.trim()) {
      return null;
    }

    const normalizedName = studentName.toLowerCase().trim();
    const existingReceipt = allReceipts.find(
      (r) => r.isIssued && r.studentName?.toLowerCase().trim() === normalizedName
    );

    return existingReceipt || null;
  }, [studentName, allReceipts]);

  if (!isOpen) return null;

  const handleStudentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentName(e.target.value);
    setShowConfirmation(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If duplicate detected and not yet confirmed, show confirmation
    if (duplicateReceipt && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    onSubmit(studentName, section);
    setStudentName('');
    setSection('XII-A');
    setShowConfirmation(false);
  };

  const sections = ['XII-A', 'XII-B', 'XII-C', 'XII-D', 'XII-E', 'XII-F', 'XII-G', 'XII-H'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 text-gray-600">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Issue Receipt #{receiptId}</h2>
        
        {duplicateReceipt && !showConfirmation && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Duplicate Detected</p>
            <p className="text-xs text-yellow-700">
              A receipt (YB25-{duplicateReceipt.receiptId < 10 ? "00" : ""}{(duplicateReceipt.receiptId > 10 && duplicateReceipt.receiptId < 100) ? "0" : ""}{duplicateReceipt.receiptId}) 
              has already been issued to <strong>{duplicateReceipt.studentName}</strong> in section <strong>{duplicateReceipt.section}</strong>.
            </p>
          </div>
        )}

        {showConfirmation && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Confirm Duplicate Issue</p>
            <p className="text-xs text-red-700">
              Are you sure you want to issue another receipt to this student? This should only be done if it&apos;s a different student with the same name.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
            <input
              type="text"
              value={studentName}
              onChange={handleStudentNameChange}
              className="w-full border rounded p-2"
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full border rounded p-2"
            >
              {sections.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            {showConfirmation ? (
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Issue Anyway
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {duplicateReceipt ? 'Review Duplicate' : 'Confirm Issue'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
