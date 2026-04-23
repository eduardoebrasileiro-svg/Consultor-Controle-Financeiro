import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Calendar,
  Wallet,
  ArrowRight,
  Building2,
  CreditCard
} from 'lucide-react';
import { db, Goal, CategoryBudget, Account, CreditCard as CreditCardType } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Goals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    const gQuery = query(collection(db, 'goals'), where('userId', '==', user.uid));
    const bQuery = query(collection(db, 'budgets'), where('userId', '==', user.uid));
    const aQuery = query(collection(db, 'accounts'), where('userId', '==', user.uid));
    const ccQuery = query(collection(db, 'creditCards'), where('userId', '==', user.uid));

    const unsubG = onSnapshot(gQuery, (snap) => {
      setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Goal)));
    });

    const unsubB = onSnapshot(bQuery, (snap) => {
      setBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() } as CategoryBudget)));
    });

    const unsubA = onSnapshot(aQuery, (snap) => {
      setAccounts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Account)));
    });

    const unsubCC = onSnapshot(ccQuery, (snap) => {
      setCreditCards(snap.docs.map(d => ({ id: d.id, ...d.data() } as CreditCardType)));
    });

    return () => { unsubG(); unsubB(); unsubA(); unsubCC(); };
  }, [user]);

  const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    
    await addDoc(collection(db, 'goals'), {
      userId: user.uid,
      title: formData.get('title'),
      targetAmount: Number(formData.get('targetAmount')),
      currentAmount: 0,
      deadline: new Date(formData.get('deadline') as string),
      createdAt: serverTimestamp()
    });
    setShowGoalModal(false);
  };

  const handleAddBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    
    await addDoc(collection(db, 'budgets'), {
      userId: user.uid,
      category: formData.get('category'),
      limit: Number(formData.get('limit')),
      month: format(new Date(), 'yyyy-MM')
    });
    setShowBudgetModal(false);
  };

  const handleAddAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    
    await addDoc(collection(db, 'accounts'), {
      userId: user.uid,
      name: formData.get('name'),
      type: formData.get('type'),
      initialBalance: Number(formData.get('initialBalance')),
      createdAt: serverTimestamp()
    });
    setShowAccountModal(false);
  };

  const handleAddCreditCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    
    await addDoc(collection(db, 'creditCards'), {
      userId: user.uid,
      bankAccountId: formData.get('bankAccountId'),
      name: formData.get('name'),
      brand: formData.get('brand'),
      lastDigits: formData.get('lastDigits'),
      totalLimit: Number(formData.get('totalLimit')),
      closingDay: Number(formData.get('closingDay')),
      dueDay: Number(formData.get('dueDay')),
      createdAt: serverTimestamp()
    });
    setShowCreditCardModal(false);
  };

  return (
    <div className="space-y-10">
      {/* Contas Bancárias */}
      <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight italic">Contas & Cartões</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Gerencie suas fontes de recursos</p>
            </div>
            <button 
              onClick={() => setShowAccountModal(true)}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {accounts.map(account => (
              <div key={account.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    account.type === 'Cartão de Crédito' ? 'bg-rose-500/10 text-rose-400' :
                    account.type === 'Banco' ? 'bg-indigo-500/10 text-indigo-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {account.type === 'Cartão de Crédito' ? <CreditCard className="w-5 h-5" /> :
                     account.type === 'Banco' ? <Building2 className="w-5 h-5" /> :
                     <Wallet className="w-5 h-5" />}
                  </div>
                  <button onClick={() => deleteDoc(doc(db, 'accounts', account.id!))} className="text-slate-600 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{account.type}</p>
                   <h3 className="font-bold text-white text-lg italic">{account.name}</h3>
                   <p className="text-xl font-bold text-white mt-1">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.initialBalance)}
                   </p>
                </div>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {creditCards.map(card => (
              <div key={card.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <button onClick={() => deleteDoc(doc(db, 'creditCards', card.id!))} className="text-slate-600 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                     {card.brand} •••• {card.lastDigits}
                   </p>
                   <h3 className="font-bold text-white text-lg italic">{card.name}</h3>
                   <div className="flex justify-between items-center mt-2">
                     <p className="text-[10px] text-slate-400 uppercase font-black">Fech: {card.closingDay} • Venc: {card.dueDay}</p>
                     <p className="text-[10px] text-slate-400 capitalize font-black">Limite: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.totalLimit)}</p>
                   </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all"></div>
              </div>
            ))}
            <button 
              onClick={() => setShowCreditCardModal(true)}
              className="bg-slate-950 border border-slate-800 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-900 transition-all text-slate-500 hover:text-indigo-400"
            >
              <Plus className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Cartão</span>
            </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Metas de Economia */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight italic">Metas de Economia</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Sonhe grande, salve planejado</p>
            </div>
            <button 
              onClick={() => setShowGoalModal(true)}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="grid gap-4">
            {goals.map(goal => (
              <div key={goal.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="font-bold text-white text-lg">{goal.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <p className="text-[10px] text-slate-500 uppercase font-black">Expira em {format(new Date(goal.deadline.seconds * 1000), 'd MMM yyyy', { locale: ptBR })}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteDoc(doc(db, 'goals', goal.id!))} className="text-slate-600 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-slate-400">Progresso</span>
                    <span className="text-indigo-400">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                      className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    ></motion.div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-lg font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.currentAmount)}</p>
                    <p className="text-xs text-slate-500 font-bold self-end italic">de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.targetAmount)}</p>
                  </div>
                </div>

                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Orçamentos Mensais */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight italic">Orçamentos por Categoria</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Controle seus tetos de gastos</p>
            </div>
            <button 
              onClick={() => setShowBudgetModal(true)}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="grid gap-4">
            {budgets.map(budget => (
              <div key={budget.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-950 border border-slate-800 flex items-center justify-center rounded-2xl font-black text-xs text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {budget.category.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{budget.category}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Limite Mensal</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div>
                    <p className="text-xl font-black text-rose-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.limit)}</p>
                  </div>
                  <button onClick={() => deleteDoc(doc(db, 'budgets', budget.id!))} className="text-slate-600 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-8 mt-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                O sistema enviará alertas automáticos no seu Dashboard caso você atinja 80% do limite estabelecido em qualquer categoria.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-800 shadow-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6 italic">Nova Meta</h2>
              <form onSubmit={handleAddGoal} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Título do Objetivo</label>
                  <input name="title" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Viagem de Fim de Ano" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Alvo</label>
                    <input name="targetAmount" type="number" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="R$ 0,00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Prazo</label>
                    <input name="deadline" type="date" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowGoalModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-xs">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase text-xs shadow-lg shadow-indigo-900/20 active:scale-95">Criar Meta</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showBudgetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-800 shadow-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6 italic">Novo Orçamento</h2>
              <form onSubmit={handleAddBudget} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</label>
                  <select name="category" className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Alimentação</option>
                    <option>Transporte</option>
                    <option>Lazer</option>
                    <option>Saúde</option>
                    <option>Moradia</option>
                    <option>Investimento</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Limite Mensal</label>
                  <input name="limit" type="number" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="R$ 0,00" />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-xs">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase text-xs shadow-lg shadow-indigo-900/20 active:scale-95">Definir Teto</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-800 shadow-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6 italic">Nova Conta / Cartão</h2>
              <form onSubmit={handleAddAccount} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome da Instituição</label>
                  <input name="name" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Banco Santander, Nubank..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo</label>
                    <select name="type" className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="Banco">Banco (Corrente)</option>
                      <option value="Carteira">Carteira (Dinheiro)</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Saldo Inicial</label>
                    <input name="initialBalance" type="number" step="0.01" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="R$ 0,00" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowAccountModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-xs">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase text-xs shadow-lg shadow-indigo-900/20 active:scale-95">Cadastrar Conta</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {showCreditCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-800 shadow-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6 italic">Novo Cartão de Crédito</h2>
              <form onSubmit={handleAddCreditCard} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome do Cartão</label>
                    <input name="name" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Ex: Nubank Black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bandeira</label>
                    <select name="brand" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="Elo">Elo</option>
                        <option value="Amex">Amex</option>
                        <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Números Finais</label>
                    <input name="lastDigits" maxLength={4} required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="1234" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vincular à Conta</label>
                    <select name="bankAccountId" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                        <option value="">Selecione...</option>
                        {accounts.filter(a => a.type === 'Banco').map(acc => (
                          <option key={acc.id} value={acc.name}>{acc.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Limite Total</label>
                    <input name="totalLimit" type="number" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="R$ 0,00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Info Fatura</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input name="closingDay" type="number" min="1" max="31" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Fech." />
                      <input name="dueDay" type="number" min="1" max="31" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Venc." />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowCreditCardModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-xs">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold uppercase text-xs shadow-lg shadow-rose-900/20 active:scale-95">Salvar Cartão</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
