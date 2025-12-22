'use client';

import { useState, useMemo } from 'react';
import { Receipt } from '../types';
import { generateReceiptPdf } from '../utils/generateReceiptPdf';
import { formatReceiptId } from '../utils/formatReceiptId';

interface ReceiptCardProps {
  receipt: Receipt;
  isAdmin: boolean;
  onIssue: (receipt: Receipt) => void;
  allReceipts?: Receipt[];
}

export default function ReceiptCard({ receipt, isAdmin, onIssue, allReceipts = [] }: ReceiptCardProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Check for duplicate receipts issued to the same student
  const duplicateReceipts = useMemo(() => {
    if (!receipt.isIssued || !receipt.studentName || !allReceipts.length) {
      return [];
    }

    const normalizedName = receipt.studentName.toLowerCase().trim();
    return allReceipts.filter(
      (r) => r.id !== receipt.id && 
             r.isIssued && 
             r.studentName?.toLowerCase().trim() === normalizedName
    );
  }, [receipt, allReceipts]);

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
  
  const hasDuplicates = duplicateReceipts.length > 0;
  
  const cardClassName = `p-4 border rounded shadow-sm ${
    receipt.isIssued ? 'bg-green-50 border-green-200' : 'bg-white'
  } ${hasDuplicates ? 'border-yellow-500 border-2' : ''}`;
  
  return (
    <div className={cardClassName}>
      {hasDuplicates && (
        <div className="mb-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-xs">
          <p className="font-semibold text-yellow-800">⚠️ Duplicate Detected</p>
          <p className="text-yellow-700">
            {duplicateReceipts.length} other receipt{duplicateReceipts.length > 1 ? 's' : ''} issued to {receipt.studentName}:
            {' '}
            {duplicateReceipts.map((dup, index) => (
              <span key={dup.id}>
                {index > 0 && ', '}
                <span className="font-medium">{formatReceiptId(dup.receiptId)}</span>
              </span>
            ))}
          </p>
        </div>
      )}
      <div className="flex justify-between items-start text-gray-700">
        <div>
          <h3 className="font-bold text-lg">Receipt {formatReceiptId(receipt.receiptId)}</h3>
          {receipt.isIssued ? (
            <div className="mt-2 text-sm">
              <p><span className="font-semibold">Student:</span> {receipt.studentName}</p>
              {receipt.section && <p><span className="font-semibold">Section:</span> {receipt.section}</p>}
              <p><span className="font-semibold">Issued By:</span> {receipt.issuingStudentName}</p>
              <p><span className="font-semibold">Date:</span> {new Date(receipt.issuedAt!).toLocaleDateString()}</p>
              <p><span className="font-semibold">Time:</span> {new Date(receipt.issuedAt!).toLocaleTimeString()}</p>
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
