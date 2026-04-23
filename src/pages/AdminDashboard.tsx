import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  Shield, 
  Info,
  Calendar,
  Save,
  ChevronLeft,
  MessageSquare
} from 'lucide-react';
import { db, UserProfile, Transaction, Planning, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, getDocs, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const [managedUsers, setManagedUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [userPlanning, setUserPlanning] = useState<Planning | null>(null);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Planning form state
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [adminInstructions, setAdminInstructions] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'user'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setManagedUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const currentMonth = format(new Date(), 'yyyy-MM');
    const transQ = query(collection(db, 'transactions'), where('userId', '==', selectedUser.uid));
    const unsubscribeTrans = onSnapshot(transQ, (snapshot) => {
      setUserTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    });

    const planningId = `${selectedUser.uid}_${currentMonth}`;
    const unsubscribePlanning = onSnapshot(doc(db, 'planning', planningId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Planning;
        setUserPlanning(data);
        setBudgetLimit(data.budgetLimit);
        setAdminInstructions(data.adminInstructions);
      }
    });

    return () => {
      unsubscribeTrans();
      unsubscribePlanning();
    };
  }, [selectedUser]);

  const handleUpdatePlanning = async () => {
    if (!selectedUser || !userPlanning) return;
    setIsSaving(true);
    try {
      const currentMonth = format(new Date(), 'yyyy-MM');
      const planningId = `${selectedUser.uid}_${currentMonth}`;
      await updateDoc(doc(db, 'planning', planningId), {
        budgetLimit: Number(budgetLimit),
        adminInstructions,
        updatedAt: serverTimestamp()
      });
      alert('Planejamento atualizado com sucesso!');
    } catch (error) {
      handleFirestoreError(error, 'update', 'planning');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = managedUsers.filter(u => 
    u.displayName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {!selectedUser ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black tracking-tighter text-white">Central de Supervisão</h3>
                <p className="text-olive-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Gestão de Operações ESTRATÉGIA</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-500" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome ou email..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-olive-900 border border-olive-800 text-white pl-12 pr-6 py-3 rounded-2xl w-full md:w-80 focus:ring-2 focus:ring-olive-500 outline-none font-medium text-sm transition-all shadow-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((u) => (
                <button
                   key={u.uid}
                   onClick={() => setSelectedUser(u)}
                   className="bg-olive-900 p-8 rounded-[2.5rem] border border-olive-800 text-left hover:border-olive-500/50 hover:bg-olive-900/50 hover:shadow-2xl hover:shadow-olive-500/10 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-olive-500/10 border border-olive-500/20 flex items-center justify-center text-xl font-black text-olive-400 group-hover:bg-olive-600 group-hover:text-white transition-all duration-300">
                      {u.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-white leading-none mb-1">{u.displayName}</p>
                      <p className="text-xs text-olive-500 font-medium italic">{u.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-olive-800">
                    <div className="flex items-center gap-2 text-[8px] font-black text-olive-500 tracking-[0.2em] uppercase">
                      <Shield className="w-3 h-3 text-emerald-500" />
                      Status Operacional
                    </div>
                    <div className="flex items-center gap-2 text-olive-400 font-bold text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Detalhes
                        <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <button 
              onClick={() => setSelectedUser(null)}
              className="flex items-center gap-2 font-bold text-olive-500 hover:text-white transition-colors group"
            >
              <div className="p-2 bg-olive-900 rounded-lg group-hover:bg-olive-800 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <span className="text-xs uppercase tracking-widest">Retornar à Central</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Overview & Transactions */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-olive-900 p-10 rounded-[2.5rem] border border-olive-800 flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-olive-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-olive-500/20">
                      {selectedUser.displayName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white leading-none mb-2">{selectedUser.displayName}</h3>
                      <p className="text-sm text-olive-500 italic">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-olive-500 mb-1 leading-none">Score de Atividade</p>
                    <p className="text-4xl font-black tracking-tighter text-white">{userTransactions.length}</p>
                  </div>
                </div>

                <div className="bg-olive-900 rounded-[2.5rem] border border-olive-800 overflow-hidden shadow-xl">
                  <div className="p-8 border-b border-olive-800 flex items-center justify-between">
                      <h3 className="font-bold text-lg text-white">Extrato Consolidado</h3>
                      <div className="px-3 py-1 bg-olive-800 rounded-full border border-olive-700 text-[8px] font-black uppercase tracking-widest text-olive-500">Fluxo de Caixa</div>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto divide-y divide-olive-800">
                    {userTransactions.map(t => (
                      <div key={t.id} className="p-6 flex items-center justify-between hover:bg-olive-800/30 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {t.category.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-olive-200 italic">{t.description}</p>
                            <p className="text-[10px] text-olive-500 uppercase font-black tracking-widest mt-1 bg-olive-950/50 px-1.5 py-0.5 rounded w-fit">{t.category}</p>
                          </div>
                        </div>
                        <p className={`font-bold text-lg ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit Planning */}
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-olive-900 p-10 rounded-[2.5rem] border border-olive-800 shadow-2xl shadow-olive-900/10">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-white italic">
                    <Edit3 className="w-5 h-5 text-olive-400" />
                    Ajuste Diretivo
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-olive-500">Teto Orçamentário</label>
                       <input 
                        type="number" 
                        value={budgetLimit}
                        onChange={(e) => setBudgetLimit(Number(e.target.value))}
                        className="w-full bg-olive-950 border border-olive-800 rounded-2xl p-5 font-bold text-xl text-white focus:ring-2 focus:ring-olive-500 outline-none transition-all" 
                        placeholder="0.00"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-olive-500">Instruções de Auditoria</label>
                       <textarea 
                        value={adminInstructions}
                        onChange={(e) => setAdminInstructions(e.target.value)}
                        className="w-full h-48 bg-olive-950 border border-olive-800 rounded-2xl p-6 font-medium text-olive-300 focus:ring-2 focus:ring-olive-500 outline-none resize-none leading-relaxed italic"
                        placeholder="Ex: Priorize reduzir gastos operacionais..."
                       ></textarea>
                    </div>

                    <button 
                      onClick={handleUpdatePlanning}
                      disabled={isSaving}
                      className="w-full bg-olive-600 text-white py-5 rounded-2xl font-bold text-sm tracking-widest hover:bg-olive-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-olive-900/20 active:scale-95"
                    >
                      <Save className="w-5 h-5" />
                      {isSaving ? 'PROCESSANDO...' : 'ATUALIZAR DIRETIVA'}
                    </button>
                  </div>
                </div>

                {/* User Notes Review */}
                <div className="bg-olive-950 p-10 rounded-[2.5rem] border border-olive-800">
                  <h3 className="text-sm font-bold mb-6 flex items-center gap-3 uppercase tracking-widest text-olive-400">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Resposta do Usuário
                  </h3>
                  <div className="p-6 bg-olive-900 rounded-2xl border border-olive-800 border-l-4 border-olive-500">
                    <p className="text-xs leading-relaxed text-olive-400 italic">
                      {userPlanning?.userNotes ? `"${userPlanning.userNotes}"` : "Aguardando posicionamento do usuário subordinado."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
