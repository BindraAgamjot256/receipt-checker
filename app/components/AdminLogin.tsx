import { useState } from 'react';

interface AdminLoginProps {
  onLogin: (code: string, name: string) => boolean;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(code, name);
    if (!success) {
      setError('Invalid secret code');
    } else {
      setError('');
    }
  };

  return (
    <div className="p-4 border rounded shadow-md bg-white max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Student Council Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Secret Code</label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Your Name (Issuer)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
