import React, { useState } from 'react';
import { X, LogIn, UserPlus, Shield, Compass, Scale, Waves } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RiderLevel, Discipline } from '../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [weightKg, setWeightKg] = useState(78);
  const [riderLevel, setRiderLevel] = useState<RiderLevel>('Intermediário');
  const [homeSpot, setHomeSpot] = useState('Praia Ponta do Mel');
  const [disciplines, setDisciplines] = useState<Discipline[]>(['Kitesurf Twintip']);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          weightKg: Number(weightKg),
          riderLevel,
          homeSpot,
          disciplines,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDiscipline = (disc: Discipline) => {
    if (disciplines.includes(disc)) {
      if (disciplines.length > 1) {
        setDisciplines(disciplines.filter(d => d !== disc));
      }
    } else {
      setDisciplines([...disciplines, disc]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0F172A] text-slate-100 rounded-3xl w-full max-w-md overflow-hidden border border-slate-800 shadow-2xl my-6">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-5 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <Compass size={22} className="text-slate-950" />
            <h2 className="font-black text-base sm:text-lg text-slate-950">
              {authMode === 'login' ? 'Entrar no KiteNinja' : 'Cadastro de Novo Velejador'}
            </h2>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-slate-950 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-[#0B132B] text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 font-black ${
              authMode === 'login'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Já tenho conta
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 font-black ${
              authMode === 'register'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Criar Novo Perfil
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
          {authMode === 'register' && (
            <div>
              <label className="block font-bold text-slate-300 mb-1">Nome Completo do Rider</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Tarcyo Alves"
                className="w-full p-2.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white font-bold focus:outline-hidden focus:border-cyan-400"
                required
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full p-2.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white font-semibold focus:outline-hidden focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white font-semibold focus:outline-hidden focus:border-cyan-400"
              required
            />
          </div>

          {authMode === 'register' && (
            <>
              {/* Weight & Level */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Scale size={12} className="text-cyan-400" />
                    <span>Seu Peso (kg)</span>
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="140"
                    value={weightKg}
                    onChange={e => setWeightKg(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-[#1E293B] border border-slate-700 text-cyan-400 font-black focus:outline-hidden focus:border-cyan-400"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Para cálculo de pipa</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nível de Velejo</label>
                  <select
                    value={riderLevel}
                    onChange={e => setRiderLevel(e.target.value as RiderLevel)}
                    className="w-full p-2 rounded-xl bg-[#1E293B] border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-cyan-400"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                    <option value="Profissional">Profissional</option>
                  </select>
                </div>
              </div>

              {/* Home Spot */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Seu Home Spot Principal</label>
                <input
                  type="text"
                  value={homeSpot}
                  onChange={e => setHomeSpot(e.target.value)}
                  placeholder="Ex: Ponta do Mel, Cumbuco, Galinhos..."
                  className="w-full p-2.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white font-semibold focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              {/* Modalidades */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Modalidades Praticadas</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Kitesurf Twintip', 'Hydrofoil', 'Wingfoil', 'Big Air'] as Discipline[]).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDiscipline(d)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-colors ${
                        disciplines.includes(d)
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-xs'
                          : 'bg-[#1E293B] border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Database info banner */}
          <div className="p-3 rounded-xl bg-[#1E293B] border border-slate-700 text-[11px] text-slate-300 flex items-center gap-2.5">
            <Shield size={16} className="text-emerald-400 shrink-0" />
            <span>
              Sincronização em nuvem e histórico criptografado. Compatível com Vercel & Neon DB.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
          >
            {authMode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            <span>{authMode === 'login' ? 'Entrar e Sincronizar' : 'Criar Perfil de Rider'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
