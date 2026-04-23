import React, { useState } from 'react';
import { LogIn, Wallet, Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F5F5F4] flex items-center justify-center p-6 font-sans">
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-olive-100/50 border border-[#E5E5E5]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Wallet className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A] mb-2 uppercase italic">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-[#666] text-sm">
            {mode === 'login' 
              ? 'Acesse sua inteligência financeira agora.' 
              : 'Comece sua jornada para a liberdade financeira.'}
          </p>
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
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-400" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    required
                    className="w-full bg-[#FAFAFA] border border-[#EEEEEE] py-4 pl-12 pr-4 rounded-2xl focus:border-[#1A1A1A] outline-none transition-all font-bold text-sm"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      role === 'user' 
                        ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' 
                        : 'border-[#EEEEEE] text-olive-400 hover:border-olive-300'
                    }`}
                  >
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Usuário</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      role === 'admin' 
                        ? 'border-olive-600 bg-olive-600 text-white shadow-lg shadow-olive-900/20' 
                        : 'border-[#EEEEEE] text-olive-400 hover:border-olive-300'
                    }`}
                  >
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Administrador</span>
                  </button>
                </div>
                <p className="text-[10px] text-olive-400 text-center font-bold px-4">
                  * Administradores podem gerenciar usuários e planejar orçamentos globais.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-400" />
            <input
              type="email"
              placeholder="E-mail"
              required
              className="w-full bg-[#FAFAFA] border border-[#EEEEEE] py-4 pl-12 pr-4 rounded-2xl focus:border-[#1A1A1A] outline-none transition-all font-bold text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-400" />
            <input
              type="password"
              placeholder="Senha"
              required
              className="w-full bg-[#FAFAFA] border border-[#EEEEEE] py-4 pl-12 pr-4 rounded-2xl focus:border-[#1A1A1A] outline-none transition-all font-bold text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Entrar' : 'Cadastrar'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-[1px] bg-[#EEEEEE] flex-1" />
          <span className="text-[10px] font-black text-olive-400 uppercase tracking-widest">Ou continue com</span>
          <div className="h-[1px] bg-[#EEEEEE] flex-1" />
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full mt-8 flex items-center justify-center gap-4 bg-white border border-[#EEEEEE] py-4 rounded-2xl hover:bg-[#FAFAFA] transition-all group font-bold text-sm text-[#1A1A1A]"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" />
          Google
        </button>

        <p className="mt-8 text-center text-sm text-[#888]">
          {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          <button 
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="ml-2 text-[#1A1A1A] font-bold hover:underline"
          >
            {mode === 'login' ? 'Cadastre-se' : 'Fazer login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
