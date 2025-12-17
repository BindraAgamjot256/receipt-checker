'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Receipt } from './types';
import { useAdmin } from './hooks/useAdmin';
import ReceiptCard from './components/ReceiptCard';
import AdminLogin from './components/AdminLogin';
import IssueModal from './components/IssueModal';

function normalize(text: string | null | undefined) {
  return (text ?? '').toLowerCase().trim();
}

export default function Home() {
  const { isAdmin, issuerName, login, isLoaded } = useAdmin();

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const [search, setSearch] = useState('');
  const [searchByKid, setSearchByKid] = useState(true);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allNames, setAllNames] = useState<string[]>([]);

  // Admin realtime listener
  useEffect(() => {
    if (!isLoaded || !isAdmin) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const q = query(collection(db, 'receipts'), orderBy('receiptId'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Receipt[] = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Receipt)
      );
      setReceipts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isLoaded, isAdmin]);

  // Load all student names once for autosuggest
  useEffect(() => {
    if (isAdmin) return;

    const loadNames = async () => {
      const snapshot = await getDocs(collection(db, 'receipts'));
      const names = snapshot.docs
          .map((d) => d.data().studentName)
          .filter(Boolean) as string[];

      setAllNames(Array.from(new Set(names)));
    };

    loadNames();
  }, [isAdmin]);

  // Autosuggestions
  useEffect(() => {
    if (!search || !searchByKid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }

    const s = normalize(search);

    const matches = allNames.filter((name) =>
        normalize(name).includes(s)
    );

    setSuggestions(matches.slice(0, 5));
  }, [search, searchByKid, allNames]);

  const handleIssue = async (studentName: string, section: string) => {
    if (!selectedReceipt || !issuerName) return;

    const receiptRef = doc(db, 'receipts', selectedReceipt.id);

    await updateDoc(receiptRef, {
      studentName,
      section,
      issuingStudentName: issuerName,
      issuedAt: new Date().toISOString(),
      isIssued: true,
    });

    setSelectedReceipt(null);
  };

  const initializeDatabase = async () => {
    setLoading(true);

    const receiptsRef = collection(db, 'receipts');
    const snapshot = await getDocs(receiptsRef);

    if (!snapshot.empty) {
      alert('Database already initialized');
      setLoading(false);
      return;
    }

    const batch = writeBatch(db);
    for (let i = 1; i <= 101; i++) {
      batch.set(doc(receiptsRef), {
        receiptId: i,
        isIssued: false,
        studentName: null,
        section: null,
        issuingStudentName: null,
        issuedAt: null,
      });
    }

    await batch.commit();
    setLoading(false);
  };

  const extractReceiptNumber = (input: string): number | null => {
    const match = input.match(/(\d+)/);
    if (!match) return null;
    return parseInt(match[1], 10);
  };

  const submitSearch = async () => {
    if (!search.trim()) {
      setReceipts([]);
      return;
    }

    setLoading(true);

    const snapshot = await getDocs(
        query(collection(db, 'receipts'), orderBy('receiptId'))
    );

    // ⚠️ Discouragement, not prohibition
    if (!searchByKid) {
      alert('receipt id search is buggy af right now, use names if you can');
    }

    const s = normalize(search);
    const receiptNumber = extractReceiptNumber(search);

    const results: Receipt[] = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as Receipt))
        .filter((r) => {
          if (searchByKid) {
            return normalize(r.studentName).includes(s);
          }

          if (receiptNumber === null) return false;
          return r.receiptId === receiptNumber;
        });

    setReceipts(results);
    setSuggestions([]);
    setLoading(false);
  };


  if (!isLoaded) return null;

  return (
      <main className="min-h-screen bg-slate-100">
        <header className="sticky top-0 z-20 bg-blue-900 text-white shadow">
          <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
            <h1 className="text-xl font-bold tracking-wide">
              Yearbook Receipt Tracker
            </h1>

            {isAdmin ? (
                <div className="flex items-center gap-3">
              <span className="rounded bg-blue-700 px-3 py-1 text-sm">
                Issuer: {issuerName}
              </span>

                  {receipts.length === 0 && (
                      <button
                          onClick={initializeDatabase}
                          className="rounded bg-yellow-400 px-3 py-1 text-sm font-semibold text-black hover:bg-yellow-300"
                      >
                        Initialize DB
                      </button>
                  )}
                </div>
            ) : (
                <button
                    onClick={() => setShowLogin((v) => !v)}
                    className="rounded bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-slate-100"
                >
                  {showLogin ? 'Cancel Login' : 'Council Login'}
                </button>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-6xl p-4">
          {!isAdmin && (
              <>
                {showLogin && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                        onClick={() => setShowLogin(false)}
                    >
                      <div
                          className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl text-gray-600"
                          onClick={(e) => e.stopPropagation()}
                      >
                        {/* Cancel (X) button */}
                        <button
                            onClick={() => setShowLogin(false)}
                            className="absolute right-3 top-3 rounded px-2 py-1 text-sm text-gray-500 hover:bg-slate-100"
                        >
                          ✕
                        </button>

                        <AdminLogin
                            onLogin={(code, name) => {
                              const success = login(code, name);
                              if (success) setShowLogin(false);
                              return success;
                            }}
                        />
                      </div>
                    </div>
                )}



                <div className="relative flex flex-wrap items-end gap-3 rounded bg-white p-4 shadow text-gray-600">
                  <div className="flex flex-col w-full md:w-64">
                    <label className="text-sm font-semibold text-gray-600">
                      Search student
                    </label>
                    <input
                        className="rounded border px-3 py-2"
                        placeholder="Type a name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {suggestions.length > 0 && (
                        <div className="absolute top-full z-10 w-64 rounded border bg-white shadow">
                          {suggestions.map((name) => (
                              <button
                                  key={name}
                                  className="block w-full px-3 py-2 text-left hover:bg-slate-100"
                                  onClick={() => {
                                    setSearch(name);
                                    setSuggestions([]);
                                  }}
                              >
                                {name}
                              </button>
                          ))}
                        </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={searchByKid}
                        onChange={(e) => setSearchByKid(e.target.checked)}
                    />
                    Search by student name
                  </label>

                  <button
                      onClick={submitSearch}
                      className="rounded bg-blue-800 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>

                {loading && (
                    <p className="mt-6 text-center text-gray-600">Searching...</p>
                )}

                {!loading && receipts.length === 0 && (
                    <p className="mt-6 text-center text-gray-600">
                      No receipt found
                    </p>
                )}

                {!loading && receipts.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {receipts.map((receipt) => (
                          <ReceiptCard
                              key={receipt.id}
                              receipt={receipt}
                              isAdmin={isAdmin}
                              onIssue={setSelectedReceipt}
                          />
                      ))}
                    </div>
                )}
              </>
          )}

          {isAdmin && (
              <>
                {loading ? (
                    <div className="py-12 text-center text-gray-600">
                      Loading receipts...
                    </div>
                ) : (
                    <>
                      <div className="mb-4 flex justify-between text-sm text-gray-600">
                        <span>Total: {receipts.length} | Issued: {receipts.filter((r) => r.isIssued).length}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {receipts.map((receipt) => (
                            <ReceiptCard
                                key={receipt.id}
                                receipt={receipt}
                                isAdmin={isAdmin}
                                onIssue={setSelectedReceipt}
                            />
                        ))}
                      </div>
                    </>
                )}
              </>
          )}
        </div>

        <footer className="mt-10 pb-4 text-center text-sm text-gray-500">
          Made with ❤️ by Agamjot Singh Bindra
        </footer>

        <IssueModal
            isOpen={!!selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
            onSubmit={handleIssue}
            receiptId={selectedReceipt?.receiptId ?? null}
        />
      </main>
  );
}
