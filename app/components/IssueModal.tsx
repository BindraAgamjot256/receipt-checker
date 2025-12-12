import { useState } from 'react';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentName: string, section: string) => void;
  receiptId: number | null;
}

export default function IssueModal({ isOpen, onClose, onSubmit, receiptId }: IssueModalProps) {
  const [studentName, setStudentName] = useState('');
  const [section, setSection] = useState('XII-A');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(studentName, section);
    setStudentName('');
    setSection('XII-A');
  };

  const sections = ['XII-A', 'XII-B', 'XII-C', 'XII-D', 'XII-E', 'XII-F', 'XII-G', 'XII-H'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Issue Receipt #{receiptId}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
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
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirm Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
