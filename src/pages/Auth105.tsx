import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo105 from '@/components/Logo105';

const Auth105 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/kaolack-105');
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    }
  };

  if (isAuthenticated) {
    navigate('/kaolack-105');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-yellow-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        {/* Logo 105 ans de Kaolack */}
        <div className="flex justify-center mb-6">
          <Logo105 size="xl" variant="white-bg" className="rounded-lg shadow-md" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">Accès aux 105 ans de Kaolack</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Votre email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Votre mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ? 
            <a href="/register105" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
              Créer un compte
            </a>
          </p>
        </div>
        
        <div className="mt-4 text-center text-gray-500 text-xs">
          © 2025 Ville de Kaolack – Accès réservé au module anniversaire
        </div>
      </div>
    </div>
  );
};

export default Auth105;
