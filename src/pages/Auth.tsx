import React, { useState } from 'react';
import { LogIn, Star, Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { 
  auth, 
  db, 
  signInWithGoogle 
} from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

type AuthMode = 'login' | 'register';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName });
        
        // Create profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName,
          role,
          createdAt: serverTimestamp()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-olive-950 flex items-center justify-center p-6 font-sans">
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-olive-900 rounded-[3rem] p-12 shadow-2xl border border-olive-800 relative overflow-hidden"
      >
        <div className="text-center mb-8 relative z-10">
          <div className="w-20 h-20 bg-olive-950 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-olive-800 transition-transform hover:scale-105">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">
              <path d="M12 1L14.39 8.26H22L15.81 12.75L18.19 20L12 15.5L5.81 20L8.19 12.75L2 8.26H9.61L12 1Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-[0.2em] text-white mb-2 uppercase italic text-center">
            ESTRATÉGIA
            <span className="block text-[10px] tracking-[0.4em] text-olive-500 font-medium not-italic mt-1">CONSULTORIA</span>
          </h1>
          <div className="h-px w-12 bg-yellow-400/30 mx-auto my-4"></div>
          <h2 className="text-xs font-black text-olive-400 uppercase tracking-widest">
            {mode === 'login' ? 'Identificação Requerida' : 'Registro de Operador'}
          </h2>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div 
                key="register-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-600" />
                  <input
                    type="text"
                    placeholder="NOME COMPLETO"
                    required
                    className="w-full bg-olive-950 border border-olive-800 py-5 pl-14 pr-6 rounded-2xl focus:border-yellow-400/50 outline-none transition-all font-bold text-xs text-white placeholder:text-olive-800 tracking-widest"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                      role === 'user' 
                        ? 'border-olive-500 bg-olive-500/10 text-white' 
                        : 'border-olive-800 text-olive-700 hover:border-olive-600'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Usuário</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                      role === 'admin' 
                        ? 'border-olive-500 bg-olive-500/10 text-white' 
                        : 'border-olive-800 text-olive-700 hover:border-olive-600'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Supervisor</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-600" />
            <input
              type="email"
              placeholder="E-MAIL INSTITUCIONAL"
              required
              className="w-full bg-olive-950 border border-olive-800 py-5 pl-14 pr-6 rounded-2xl focus:border-yellow-400/50 outline-none transition-all font-bold text-xs text-white placeholder:text-olive-800 tracking-widest"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-600" />
            <input
              type="password"
              placeholder="CRIPTO-SENHA"
              required
              className="w-full bg-olive-950 border border-olive-800 py-5 pl-14 pr-6 rounded-2xl focus:border-yellow-400/50 outline-none transition-all font-bold text-xs text-white placeholder:text-olive-800 tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-olive-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-olive-500 transition-all shadow-xl shadow-olive-950/50 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Acessar Terminal' : 'Efetuar Cadastro'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 flex items-center gap-4 relative z-10">
          <div className="h-px bg-olive-800 flex-1" />
          <span className="text-[8px] font-black text-olive-700 uppercase tracking-[0.3em]">Autenticação Externa</span>
          <div className="h-px bg-olive-800 flex-1" />
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full mt-8 flex items-center justify-center gap-4 bg-olive-950 border border-olive-800 py-5 rounded-2xl hover:bg-olive-800 transition-all group font-black text-[10px] text-white uppercase tracking-widest"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
          Google Account
        </button>

        <p className="mt-10 text-center text-[10px] text-olive-600 font-bold uppercase tracking-widest leading-tight">
          {mode === 'login' ? 'Sem credenciais de acesso?' : 'Já possui registro no sistema?'}
          <button 
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="ml-2 text-white hover:text-yellow-400 transition-colors"
          >
            {mode === 'login' ? 'SOLICITAR ACESSO' : 'VOLTAR AO TERMINAL'}
          </button>
        </p>

        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-olive-600/5 rounded-full blur-3xl pointer-events-none"></div>
      </motion.div>
    </div>
  );
};
