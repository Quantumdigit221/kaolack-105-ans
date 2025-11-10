import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo105 from '@/components/Logo105';

const Register105 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated } = useAuth();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await register({
        email,
        password,
        full_name: fullName,
        city: 'Kaolack'
      });
      navigate('/kaolack-105');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
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
        
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">Créer un compte - 105 ans de Kaolack</h2>
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              id="fullName"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Votre nom complet"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Votre adresse email"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Répétez votre mot de passe"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ? 
            <a href="/auth105" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
              Se connecter
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

export default Register105;