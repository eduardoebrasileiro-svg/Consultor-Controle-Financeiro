import React from 'react';
import { LogIn, Wallet } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';

export const Auth: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F4] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-indigo-100/50 border border-[#E5E5E5] text-center"
      >
        <div className="w-20 h-20 bg-[#1A1A1A] rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-black/10">
          <Wallet className="text-white w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A] mb-4">Bem-vindo ao Finanças Pro</h1>
        <p className="text-[#666] mb-12 text-lg leading-relaxed px-4">
          Acesse sua inteligência financeira com um clique. Controle, planeje e prospere.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-4 bg-white border-2 border-[#E5E5E5] py-4 rounded-2xl hover:bg-[#F9F9F9] hover:border-[#1A1A1A] transition-all group font-bold text-lg text-[#1A1A1A]"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />
          Continuar com Google
        </button>

        <p className="mt-8 text-sm text-[#888]">
          Ao entrar, você concorda com nossos termos de serviço.
        </p>
      </motion.div>
    </div>
  );
};
