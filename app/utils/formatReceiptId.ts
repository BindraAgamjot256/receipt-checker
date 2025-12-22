/**
 * Format receipt ID with YB25 prefix and proper zero padding
 * @param receiptId - The numeric receipt ID
 * @returns Formatted receipt ID string (e.g., "YB25-001", "YB25-042", "YB25-101")
 */
export function formatReceiptId(receiptId: number): string {
  const paddedId = String(receiptId).padStart(3, '0');
  return `YB25-${paddedId}`;
}
