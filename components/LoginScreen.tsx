import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-brand-secondary">
            SLNCity
            </h1>
            <p className="text-gray-600">Diagnostic Center</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            Lab Management System Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary_hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            <div className="text-center text-xs text-gray-500">
                <p>Use: sudo/sudo, admin/admin, reception/reception</p>
            </div>
          </form>
        </div>
      </div>
       <footer className="text-center py-4 text-sm text-gray-500 mt-8">
          <p>&copy; 2024 SLNCity Diagnostic Center. All rights reserved.</p>
        </footer>
    </div>
  );
};