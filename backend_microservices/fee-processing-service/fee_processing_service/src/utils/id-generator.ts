export function generateTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  const transactionId = (timestamp + random).slice(-16).padStart(16, '0');
  return transactionId;
}
