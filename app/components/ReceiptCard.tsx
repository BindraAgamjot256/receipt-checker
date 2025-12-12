import { Receipt } from '../types';

interface ReceiptCardProps {
  receipt: Receipt;
  isAdmin: boolean;
  onIssue: (receipt: Receipt) => void;
}

export default function ReceiptCard({ receipt, isAdmin, onIssue }: ReceiptCardProps) {
  return (
    <div className={`p-4 border rounded shadow-sm ${receipt.isIssued ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <div className="flex justify-between items-start text-gray-700">
        <div>
          <h3 className="font-bold text-lg">Receipt #{receipt.receiptId}</h3>
          {receipt.isIssued ? (
            <div className="mt-2 text-sm">
              <p><span className="font-semibold">Student:</span> {receipt.studentName}</p>
              <p><span className="font-semibold">Issued By:</span> {receipt.issuingStudentName}</p>
              <p><span className="font-semibold">Date:</span> {new Date(receipt.issuedAt!).toLocaleDateString()}</p>
              <p><span className="font-semibold">Time:</span> {new Date(receipt.issuedAt!).toLocaleTimeString()}</p>
            </div>
          ) : (
            <p className="text-gray-500 mt-2">Not Issued</p>
          )}
        </div>
        {!receipt.isIssued && isAdmin && (
          <button
            onClick={() => onIssue(receipt)}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Issue
          </button>
        )}
      </div>
    </div>
  );
}
