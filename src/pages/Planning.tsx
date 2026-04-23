import React, { useState, useEffect } from 'react';
import { 
  Target, 
  MessageSquare, 
  Save, 
  Info,
  Calendar,
  AlertCircle,
  Shield
} from 'lucide-react';
import { db, Planning, handleFirestoreError } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';

export const PlanningPage: React.FC = () => {
  const { user, profile } = useAuth();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const planningId = `${user.uid}_${currentMonth}`;
    const planningRef = doc(db, 'planning', planningId);

    const unsubscribe = onSnapshot(planningRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Planning;
        setPlanning(data);
        setUserNotes(data.userNotes || '');
      } else {
        // Initial planning if doesn't exist
        const initial: Planning = {
          userId: user.uid,
          month: currentMonth,
          budgetLimit: 0,
          adminInstructions: 'Aguardando orientações do administrador.',
          userNotes: '',
          updatedAt: serverTimestamp()
        };
        setDoc(planningRef, initial);
      }
    });

    return () => unsubscribe();
  }, [user, currentMonth]);

  const handleSaveNotes = async () => {
    if (!user || !planning) return;
    setIsSaving(true);
    try {
      const planningId = `${user.uid}_${currentMonth}`;
      await updateDoc(doc(db, 'planning', planningId), {
        userNotes,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'update', 'planning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Menu / Info */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-olive-900 p-8 rounded-[2rem] border border-olive-800 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-olive-800 rounded-xl flex items-center justify-center border border-olive-700">
              <Calendar className="w-6 h-6 text-olive-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Mês de Referência</h3>
              <p className="text-[10px] text-olive-500 uppercase tracking-widest font-bold capitalize">{format(new Date(), 'MMMM yyyy', { locale: ptBR })}</p>
            </div>
          </div>

          <div className="p-6 bg-olive-950 rounded-2xl border border-olive-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-olive-500 mb-2">Limite Orçamentário</p>
            <p className="text-3xl font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(planning?.budgetLimit || 0)}</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-olive-500 uppercase font-bold">
              <AlertCircle className="w-3 h-3 text-olive-500" />
              <span>Gestor: Dr. Augusto Lima</span>
            </div>
          </div>
        </div>

        <div className="bg-olive-500/5 p-6 rounded-[2rem] border border-olive-500/10">
           <div className="flex gap-4">
             <div className="w-10 h-10 bg-olive-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-olive-900/20">
               <Target className="w-5 h-5 text-white" />
             </div>
             <div>
               <p className="font-bold text-olive-400">Objetivo Estratégico</p>
               <p className="text-xs text-olive-400 mt-2 leading-relaxed italic">
                 "O planejamento anual visa a estabilidade de caixa. Siga as orientações específicas para garantir os aportes em investimentos."
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Admin Instructions */}
        <section className="bg-olive-900 p-10 rounded-[2.5rem] border border-olive-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <MessageSquare className="w-16 h-16 text-olive-800 opacity-50" />
          </div>
          <div className="relative z-10">
              <h3 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-olive-400">
                <Shield className="w-4 h-4 text-amber-500" />
                Diretivas do Administrador
              </h3>
              <div className="bg-olive-950 p-8 rounded-3xl border border-olive-800 border-l-4 border-olive-500">
                <p className="text-olive-300 leading-relaxed italic italic whitespace-pre-wrap">
                  {planning?.adminInstructions}
                </p>
              </div>
          </div>
        </section>

        {/* User Notes */}
        <section className="bg-olive-900 p-10 rounded-[2.5rem] border border-olive-800 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-bold text-white">Notas de Conciliação</h3>
                <p className="text-[10px] text-olive-500 uppercase font-bold tracking-widest mt-1">Sua resposta ao planejamento</p>
            </div>
            <button 
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="flex items-center gap-2 bg-olive-600 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-olive-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-olive-900/20"
            >
              {isSaving ? 'SALVANDO...' : (
                <>
                  <Save className="w-4 h-4" />
                  SALVAR NOTAS
                </>
              )}
            </button>
          </div>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            className="w-full h-64 bg-olive-950 border border-olive-800 rounded-3xl p-8 font-medium text-olive-300 focus:ring-2 focus:ring-olive-500 outline-none resize-none leading-relaxed italic"
            placeholder="Relate aqui seu progresso, metas extras ou justificativas para o gestor..."
          ></textarea>
        </section>
      </div>
    </div>
  );
};
