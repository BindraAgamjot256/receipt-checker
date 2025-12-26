'use client';

import { useState } from 'react';
import { Receipt } from '../types';
import { generateReceiptPdf } from '../utils/generateReceiptPdf';

interface ReceiptCardProps {
  receipt: Receipt;
  isAdmin: boolean;
  onIssue: (receipt: Receipt) => void;
  onReceive: (receipt: Receipt) => void;
}

export default function ReceiptCard({ receipt, isAdmin, onIssue, onReceive }: ReceiptCardProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await generateReceiptPdf(receipt);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate receipt PDF');
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isAdmin && !receipt.isIssued) {
    return null;
  }
  return (
    <div className={`p-4 border rounded shadow-sm ${receipt.isIssued ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <div className="flex justify-between items-start text-gray-700">
        <div>
          <h3 className="font-bold text-lg">Receipt YB25-{receipt.receiptId < 10 ? "00" : null}{(receipt.receiptId > 10 && receipt.receiptId < 100) ? "0" : null}{receipt.receiptId}</h3>
          {receipt.isIssued ? (
            <div className="mt-2 text-sm">
              <p><span className="font-semibold">Student:</span> {receipt.studentName}</p>
              {receipt.section && <p><span className="font-semibold">Section:</span> {receipt.section}</p>}
              <p><span className="font-semibold">Issued By:</span> {receipt.issuingStudentName}</p>
              <p><span className="font-semibold">Date:</span> {new Date(receipt.issuedAt!).toLocaleDateString()}</p>
              <p><span className="font-semibold">Time:</span> {new Date(receipt.issuedAt!).toLocaleTimeString()}</p>
              {receipt.used && <p><span className="font-semibold">Yearbook given by:</span> {receipt.usedBy!}</p>}
              {receipt.used && <p><span className="font-semibold">Yearbook given at:</span> {new Date(receipt.usedAt!).toLocaleString()}</p>}
            </div>
          ) : (
            <p className="text-gray-500 mt-2">Not Issued</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {!receipt.isIssued && isAdmin && (
            <button
              onClick={() => onIssue(receipt)}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Issue
            </button>
          )}
          {receipt.isIssued && isAdmin && !receipt.used && (
              <button onClick={() => onReceive(receipt)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                Received
              </button>
          )}
          {receipt.isIssued && isAdmin && receipt.used && (
              <span className="text-green-600 text-sm font-semibold">✓ Used</span>
          )}
          {!isAdmin && receipt.isIssued && (
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isPrinting ? 'Generating...' : 'Print Receipt'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
