export interface Receipt {
  id: string; // Document ID
  receiptId: number; // The visual ID (1-51)
  studentName?: string;
  section?: string;
  issuingStudentName?: string;
  issuedAt?: string; // ISO string
  isIssued: boolean;
  used?: boolean;
  usedBy?: string;
  usedAt?: string;
}
