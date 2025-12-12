'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Receipt } from './types';
import { useAdmin } from './hooks/useAdmin';
import ReceiptCard from './components/ReceiptCard';
import AdminLogin from './components/AdminLogin';
import IssueModal from './components/IssueModal';

export default function Home() {
  const { isAdmin, issuerName, login, isLoaded } = useAdmin();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'receipts'), orderBy('receiptId'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const receiptsData: Receipt[] = [];
      snapshot.forEach((doc) => {
        receiptsData.push({ id: doc.id, ...doc.data() } as Receipt);
      });
      setReceipts(receiptsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleIssue = async (studentName: string, section: string) => {
    if (!selectedReceipt || !issuerName) return;

    const receiptRef = doc(db, 'receipts', selectedReceipt.id);
    await updateDoc(receiptRef, {
      studentName,
      section,
      issuingStudentName: issuerName,
      issuedAt: new Date().toISOString(),
      isIssued: true
    });
    setSelectedReceipt(null);
  };

  const initializeDatabase = async () => {
    setLoading(true);
    const batch = writeBatch(db);
    const receiptsRef = collection(db, 'receipts');
    
    // Check if already exists to prevent duplicates
    const snapshot = await getDocs(receiptsRef);
    if (!snapshot.empty) {
      alert('Database already initialized');
      setLoading(false);
      return;
    }

    for (let i = 1; i <= 51; i++) {
      const newDocRef = doc(receiptsRef);
      batch.set(newDocRef, {
        receiptId: i,
        isIssued: false,
        studentName: null,
        section: null,
        issuingStudentName: null,
        issuedAt: null
      });
    }

    await batch.commit();
    setLoading(false);
    console.log('Database initialized');
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-gray-100 pb-10">
      <header className="bg-blue-800 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Yearbook Receipt Tracker</h1>
          <div>
            {isAdmin ? (
              <div className="flex items-center gap-4">
                <span className="text-sm bg-blue-700 px-3 py-1 rounded">
                  Issuer: {issuerName}
                </span>
                {receipts.length === 0 && (
                  <button 
                    onClick={initializeDatabase}
                    className="bg-yellow-500 text-black px-3 py-1 rounded text-sm font-bold hover:bg-yellow-400"
                  >
                    Initialize DB
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(!showLogin)}
                className="bg-white text-blue-800 px-4 py-2 rounded font-semibold hover:bg-gray-100"
              >
                {showLogin ? 'Cancel Login' : 'Council Login'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {showLogin && !isAdmin && (
          <div className="mb-8">
            <AdminLogin onLogin={(code, name) => {
              const success = login(code, name);
              if (success) setShowLogin(false);
              return success;
            }} />
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">Loading receipts...</div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div className="text-gray-600">
                Total Receipts: {receipts.length} | Issued: {receipts.filter(r => r.isIssued).length}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {receipts.map((receipt) => (
                <ReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  isAdmin={isAdmin}
                  onIssue={(r) => setSelectedReceipt(r)}
                />
              ))}
            </div>
            
            {receipts.length === 0 && !isAdmin && (
              <div className="text-center py-20 text-gray-500">
                No receipts found. Please ask an administrator to initialize the database.
              </div>
            )}
          </>
        )}
      </div>

      <IssueModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        onSubmit={handleIssue}
        receiptId={selectedReceipt?.receiptId || null}
      />
    </main>
  );
}
