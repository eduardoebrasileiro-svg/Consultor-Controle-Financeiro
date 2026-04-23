import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Sparkles,
  X,
  CreditCard,
  Building2,
  Wallet as WalletIcon,
  AlertCircle,
  Bell
} from 'lucide-react';
import { db, Transaction, handleFirestoreError, CategoryBudget, Account, Category, CreditCard as CreditCardType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, writeBatch, doc as firestoreDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { parseNotification, ParsedTransaction } from '../lib/gemini';

const OnboardingQuestionnaire: React.FC<{ onComplete: (answers: any) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    financialGoal: '',
    investmentAmount: '',
    advisoryPreference: '',
    interactionMode: ''
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(answers);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto bg-olive-900 border border-olive-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-olive-950">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(step / 4) * 100}%` }}
          className="h-full bg-olive-500 shadow-[0_0_15px_rgba(132,204,22,0.6)]"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-olive-500 font-black text-[10px] tracking-widest uppercase italic">Passo 01/04</span>
                <h2 className="text-3xl font-black text-white italic leading-tight">Qual seu principal objetivo financeiro hoje?</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'liberdade', label: 'Liberdade Financeira', icon: <Sparkles className="w-5 h-5"/>},
                  { value: 'casa', label: 'Comprar Casa própria', icon: <Building2 className="w-5 h-5"/>},
                  { value: 'aposentadoria', label: 'Aposentadoria Tranquila', icon: <TrendingUp className="w-5 h-5"/>},
                  { value: 'outros', label: 'Outros planos', icon: <Sparkles className="w-5 h-5"/>}
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setAnswers({ ...answers, financialGoal: opt.label }); handleNext(); }}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group ${
                      answers.financialGoal === opt.label 
                        ? 'border-olive-500 bg-olive-500/10 text-white' 
                        : 'border-olive-800 text-olive-500 hover:border-olive-600 hover:bg-olive-800/50'
                    }`}
                  >
                    <div className="p-3 bg-olive-950 rounded-xl group-hover:scale-110 transition-transform">
                      {opt.icon}
                    </div>
                    <span className="font-bold text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
               key="step2"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
            >
               <div className="space-y-2">
                <span className="text-olive-500 font-black text-[10px] tracking-widest uppercase italic">Passo 02/04</span>
                <h2 className="text-3xl font-black text-white italic leading-tight">Quanto está disposto a investir para atingir este resultado?</h2>
              </div>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-olive-500 font-black text-2xl">R$</div>
                <input 
                  type="number" 
                  autoFocus
                  placeholder="0,00"
                  className="w-full bg-olive-950 border-2 border-olive-800 rounded-3xl p-8 pl-16 text-3xl font-black text-white focus:border-olive-500 outline-none transition-all placeholder:text-olive-900"
                  value={answers.investmentAmount}
                  onChange={e => setAnswers({ ...answers, investmentAmount: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={handleBack} className="p-6 text-olive-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors">Voltar</button>
                <button 
                  type="button" 
                  disabled={!answers.investmentAmount}
                  onClick={handleNext} 
                  className="flex-1 bg-olive-600 text-white py-6 rounded-2xl font-bold text-lg hover:bg-olive-700 transition-all shadow-xl shadow-olive-900/20 active:scale-95 disabled:opacity-30"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
               key="step3"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-olive-500 font-black text-[10px] tracking-widest uppercase italic">Passo 03/04</span>
                <h2 className="text-3xl font-black text-white italic leading-tight">Como gostaria de ser assessorado?</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'ia', label: 'IA (Digital)', desc: 'Assistência Inteligente 24/7' },
                  { value: 'especialista', label: 'Especialista', desc: 'Consultoria Humana' },
                  { value: 'ambos', label: 'Ambos', desc: 'Híbrido personalizado' },
                  { value: 'nenhum', label: 'Nenhum', desc: 'Gestão Independente' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setAnswers({ ...answers, advisoryPreference: opt.label }); handleNext(); }}
                    className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 group ${
                      answers.advisoryPreference === opt.label 
                        ? 'border-olive-500 bg-olive-500/10 text-white' 
                        : 'border-olive-800 text-olive-500 hover:border-olive-600 hover:bg-olive-800/50'
                    }`}
                  >
                    <span className="font-bold text-sm text-white">{opt.label}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-60">{opt.desc}</span>
                  </button>
                ))}
              </div>
              <button type="button" onClick={handleBack} className="w-full p-6 text-olive-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors">Voltar</button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
               key="step4"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-olive-500 font-black text-[10px] tracking-widest uppercase italic">Passo 04/04</span>
                <h2 className="text-3xl font-black text-white italic leading-tight">Você interage melhor presencial ou online?</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'presencial', label: 'Presencial', desc: 'Reuniões físicas' },
                  { value: 'online', label: 'Online', desc: 'Vídeo e chat' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswers({ ...answers, interactionMode: opt.label })}
                    className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 group ${
                      answers.interactionMode === opt.label 
                        ? 'border-olive-500 bg-olive-500/10 text-white' 
                        : 'border-olive-800 text-olive-500 hover:border-olive-600 hover:bg-olive-800/50'
                    }`}
                  >
                    <span className="font-bold text-sm text-white">{opt.label}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-60">{opt.desc}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={handleBack} className="p-6 text-olive-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors">Voltar</button>
                <button 
                  type="submit" 
                  disabled={!answers.interactionMode}
                  className="flex-1 bg-olive-600 text-white py-6 rounded-2xl font-bold text-lg hover:bg-olive-700 transition-all shadow-xl shadow-olive-900/20 active:scale-95 disabled:opacity-30"
                >
                  Finalizar Revisão
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  
  const handleOnboardingComplete = async (answers: any) => {
    if (!user) return;
    try {
      await updateDoc(firestoreDoc(db, 'users', user.uid), {
        onboardingAnswers: {
          ...answers,
          completedAt: serverTimestamp()
        }
      });
    } catch (error) {
      handleFirestoreError(error, 'update', 'users');
    }
  };

  if (profile && !profile.onboardingAnswers) {
    return (
      <div className="min-h-screen bg-olive-950 flex items-center justify-center p-6 font-sans">
        <OnboardingQuestionnaire onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('Carteira');
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('income');
  const [selectedCC, setSelectedCC] = useState('');
  const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingNewCC, setIsAddingNewCC] = useState(false);
  const [newCCName, setNewCCName] = useState('');
  const [newCCBrand, setNewCCBrand] = useState('Visa');
  const [newCCDigits, setNewCCDigits] = useState('');
  const [newCCLimit, setNewCCLimit] = useState(0);
  const [newCCClosingDay, setNewCCClosingDay] = useState<number | undefined>(undefined);
  const [newCCDueDay, setNewCCDueDay] = useState<number | undefined>(undefined);
  const [newCCBankAccountId, setNewCCBankAccountId] = useState('');
  const [installments, setInstallments] = useState(1);
  const [transactionAmount, setTransactionAmount] = useState<number>(0);

  // Stats
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'));
    const bQ = query(collection(db, 'budgets'), where('userId', '==', user.uid));
    const aQ = query(collection(db, 'accounts'), where('userId', '==', user.uid));
    const cQ = query(collection(db, 'categories'), where('userId', '==', user.uid));

    const unsubT = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(docs);

      const income = docs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = docs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      setStats({ income, expense, balance: income - expense });
    });

    const unsubB = onSnapshot(bQ, (snap) => {
      setBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() } as CategoryBudget)));
    });

    const unsubA = onSnapshot(aQ, (snap) => {
      setAccounts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Account)));
    });

    const unsubC = onSnapshot(cQ, (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    });

    const ccQ = query(collection(db, 'creditCards'), where('userId', '==', user.uid));
    const unsubCC = onSnapshot(ccQ, (snap) => {
      setCreditCards(snap.docs.map(d => ({ id: d.id, ...d.data() } as CreditCardType)));
    });

    return () => { unsubT(); unsubB(); unsubA(); unsubC(); unsubCC(); };
  }, [user]);

  const cardLimits = useMemo(() => {
    return creditCards.map(card => {
      const usedLimit = transactions
        .filter(t => t.paymentMethod === 'Cartão de Crédito' && t.creditCardId === card.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...card,
        availableLimit: card.totalLimit - usedLimit
      };
    });
  }, [creditCards, transactions]);

  const defaultCategories = {
    income: ['Salário', 'Investimentos', 'Rendimentos'],
    expense: ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Moradia']
  };

  const filteredCategories = useMemo(() => {
    const custom = categories.filter(c => c.type === selectedType).map(c => c.name);
    return Array.from(new Set([...defaultCategories[selectedType], ...custom]));
  }, [categories, selectedType]);

  const accountBalances = useMemo(() => {
    return accounts.map(acc => {
      const totalIncome = transactions
        .filter(t => t.type === 'income' && t.account === acc.name)
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions
        .filter(t => t.type === 'expense' && t.account === acc.name)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...acc,
        currentBalance: acc.initialBalance + totalIncome - totalExpense
      };
    });
  }, [accounts, transactions]);

  const totalConsolidatedBalance = useMemo(() => {
    // Consolidated balance = sum of all account current balances + transactions without account?
    // Let's stick to the simplest: initial balances of all accounts + all net income/expense
    const sumInitial = accounts.reduce((sum, acc) => sum + acc.initialBalance, 0);
    return sumInitial + stats.balance;
  }, [accounts, stats.balance]);

  const budgetAlerts = useMemo(() => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((acc, t) => acc + t.amount, 0);
      
      const percent = (spent / budget.limit) * 100;
      if (percent >= 80) {
        return { category: budget.category, percent: Math.round(percent), spent, limit: budget.limit };
      }
      return null;
    }).filter(Boolean);
  }, [budgets, transactions]);

  const handleManualAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    const isIncome = formData.get('type') === 'income';
    let accountName = formData.get('account') as string;
    let categoryName = formData.get('category') as string;
    const installmentsCount = Number(formData.get('installments') || 1);
    const baseDate = new Date(formData.get('date') as string);
    const installmentAmount = amount / installmentsCount;
    const installmentId = crypto.randomUUID();

    try {
      if (selectedMethod === 'Banco' && isAddingNewAccount && newAccountName.trim()) {
        await addDoc(collection(db, 'accounts'), {
          userId: user?.uid,
          name: newAccountName.trim(),
          type: 'Banco',
          initialBalance: 0,
          createdAt: serverTimestamp()
        });
        accountName = newAccountName.trim();
      }

      let finalCCId = selectedCC;
      if (selectedMethod === 'Cartão de Crédito' && isAddingNewCC && newCCName.trim()) {
        const ccRef = await addDoc(collection(db, 'creditCards'), {
          userId: user?.uid,
          name: newCCName.trim(),
          brand: newCCBrand,
          lastDigits: newCCDigits,
          totalLimit: Number(newCCLimit),
          closingDay: Number(newCCClosingDay),
          dueDay: Number(newCCDueDay),
          bankAccountId: newCCBankAccountId,
          createdAt: serverTimestamp()
        });
        finalCCId = ccRef.id;
      }

      if (isAddingNewCategory && newCategoryName.trim()) {
        await addDoc(collection(db, 'categories'), {
          userId: user?.uid,
          name: newCategoryName.trim(),
          type: selectedType,
          createdAt: serverTimestamp()
        });
        categoryName = newCategoryName.trim();
      }

      const batch = writeBatch(db);
      
      for (let i = 0; i < installmentsCount; i++) {
        const transDate = new Date(baseDate);
        transDate.setMonth(baseDate.getMonth() + i);
        
        const transRef = firestoreDoc(collection(db, 'transactions'));
        batch.set(transRef, {
          userId: user?.uid,
          type: selectedType,
          amount: installmentAmount,
          category: categoryName,
          description: formData.get('description') + (installmentsCount > 1 ? ` (${i+1}/${installmentsCount})` : ''),
          paymentMethod: formData.get('paymentMethod'),
          account: accountName || '',
          creditCardId: selectedMethod === 'Cartão de Crédito' ? finalCCId : null,
          installments: installmentsCount,
          installmentIndex: i + 1,
          installmentId: installmentsCount > 1 ? installmentId : null,
          date: Timestamp.fromDate(transDate),
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      
      setShowAddModal(false);
      setIsAddingNewAccount(false);
      setNewAccountName('');
      setIsAddingNewCategory(false);
      setNewCategoryName('');
      setIsAddingNewCC(false);
      setNewCCName('');
      setNewCCDigits('');
      setNewCCLimit(0);
      setNewCCClosingDay(undefined);
      setNewCCDueDay(undefined);
      setInstallments(1);
      setSelectedCC('');
      setTransactionAmount(0);
    } catch (error) {
      handleFirestoreError(error, 'create', 'transactions');
    }
  };

  const handleImportNotification = async () => {
    if (!notificationText.trim()) return;
    setIsParsing(true);
    const parsed = await parseNotification(notificationText);
    setIsParsing(false);

    if (parsed) {
      try {
        await addDoc(collection(db, 'transactions'), {
          userId: user?.uid,
          type: parsed.type,
          amount: parsed.amount,
          category: parsed.category,
          description: parsed.description,
          paymentMethod: parsed.paymentMethod,
          account: parsed.account,
          date: Timestamp.fromDate(new Date(parsed.date)),
          createdAt: serverTimestamp()
        });
        setNotificationText('');
        setShowImportModal(false);
      } catch (error) {
        handleFirestoreError(error, 'create', 'transactions');
      }
    } else {
      alert("Não foi possível processar esta notificação. Tente copiar o texto completo.");
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Cartão de Crédito': return CreditCard;
      case 'Banco': return Building2;
      default: return WalletIcon;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Search & Alerts */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-500" />
                <input 
                    type="text" 
                    placeholder="Pesquisar nos registros financeiros..." 
                    className="w-full bg-olive-900 border border-olive-800 rounded-2xl py-4 pl-12 pr-6 font-medium text-white outline-none focus:ring-2 focus:ring-olive-500 transition-all shadow-xl"
                />
            </div>
        </div>
        <div className="col-span-1">
            <div className="flex gap-4">
                <button className="flex-1 bg-olive-900 border border-olive-800 rounded-2xl flex items-center justify-center p-4 hover:bg-olive-800 transition-all shadow-xl group">
                    <Filter className="w-5 h-5 text-olive-500 group-hover:text-white" />
                </button>
                <div className="flex-1 bg-olive-900 border border-olive-800 rounded-2xl flex items-center justify-center p-4 shadow-xl relative cursor-help" title="Lembretes Inteligentes">
                    <Bell className="w-5 h-5 text-olive-500" />
                    {budgetAlerts.length > 0 && <span className="absolute top-4 right-1/3 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_#f43f5e]"></span>}
                </div>
            </div>
        </div>
      </div>

      {/* Alertas Críticos de Orçamento */}
      <AnimatePresence>
        {budgetAlerts.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden"
            >
                {budgetAlerts.map((alert: any) => (
                    <div 
                      key={alert.category} 
                      className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-[2.5rem] flex items-center gap-4 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-900/40 z-10">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Teto Atingido</p>
                            <h4 className="font-bold text-white italic">{alert.category}: {alert.percent}%</h4>
                            <p className="text-[10px] text-rose-500/70 font-bold mt-1">Gasto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(alert.spent)}</p>
                        </div>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all"></div>
                    </div>
                ))}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 grid-rows-2 gap-6">
        <div className="col-span-2 row-span-2">
            <StatCard 
              label="Saldo Consolidado" 
              value={totalConsolidatedBalance} 
              icon={ArrowUpRight} 
              color="olive"
              large
            />
        </div>
        <div className="col-span-2 row-span-1">
            <StatCard 
              label="Receitas Mensais" 
              value={stats.income} 
              icon={TrendingUp} 
              color="olive-light"
            />
        </div>
        <div className="col-span-2 row-span-1">
            <StatCard 
              label="Despesas Mensais" 
              value={stats.expense} 
              icon={TrendingDown} 
              color="rose"
            />
        </div>
      </div>

      {/* Account Balances Row */}
      {(accountBalances.length > 0 || cardLimits.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accountBalances.map(acc => (
            <div key={acc.id} className="bg-olive-900/50 border border-olive-800 p-6 rounded-[2rem] flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-olive-500">{acc.name}</span>
                {acc.type === 'Banco' ? <Building2 className="w-3 h-3 text-olive-400" /> : <WalletIcon className="w-3 h-3 text-olive-400" />}
              </div>
              <p className="text-lg font-bold text-white tracking-tight">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.currentBalance)}
              </p>
            </div>
          ))}
          {cardLimits.map(card => (
            <div key={card.id} className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-[2rem] flex flex-col justify-between shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2 z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                  {card.brand} {card.lastDigits ? `(•• ${card.lastDigits})` : ''}
                </span>
                <CreditCard className="w-3 h-3 text-rose-400" />
              </div>
              <div className="z-10">
                <p className="text-[10px] text-white font-bold italic mb-1">{card.name}</p>
                <p className="text-lg font-bold text-white tracking-tight">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.availableLimit)}
                </p>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-[8px] text-olive-500 uppercase font-bold">F:{card.closingDay} V:{card.dueDay}</p>
                    <p className="text-[8px] text-olive-500 uppercase font-bold">Total: {Math.round((card.availableLimit / card.totalLimit) * 100)}% disp.</p>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all"></div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions & Imports */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
            <div className="bg-olive-900 border border-olive-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-olive-800 flex items-center justify-between bg-olive-900/50">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-olive-400" />
                        Transações Recentes
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-olive-800 rounded-lg transition-colors border border-olive-700">
                        <Search className="w-4 h-4 text-olive-400" />
                        </button>
                    </div>
                </div>
                
                <div className="divide-y divide-olive-800">
                    {transactions.length > 0 ? (
                        transactions.map((t) => (
                        <div key={t.id} className="p-5 flex items-center justify-between hover:bg-olive-800/30 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                    t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                }`}>
                                    {t.category.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-olive-100 italic text-sm">{t.description || t.category}</p>
                                        {(t.installments && t.installments > 1) && (
                                          <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-md font-black">
                                            PARCELA {t.installmentIndex}/{t.installments}
                                          </span>
                                        )}
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-olive-800 rounded border border-olive-700">
                                            {React.createElement(getMethodIcon(t.paymentMethod), { className: "w-2.5 h-2.5 text-olive-400" })}
                                            <span className="text-[8px] font-black text-olive-500 uppercase tracking-tighter">
                                              {t.account ? `${t.account} (${t.paymentMethod})` : t.paymentMethod}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-olive-400 uppercase tracking-widest font-bold bg-olive-800 px-1.5 py-0.5 rounded">{t.category}</p>
                                        <span className="text-[10px] text-olive-600">•</span>
                                        <p className="text-[10px] text-olive-500 uppercase font-bold">{t.date?.seconds ? format(new Date(t.date.seconds * 1000), "d MMM", { locale: ptBR }) : ''}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                            <p className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                            </p>
                            <button className="text-[8px] font-black uppercase tracking-tighter text-olive-400 opacity-0 group-hover:opacity-100 transition-opacity">Detalhes</button>
                            </div>
                        </div>
                        ))
                    ) : (
                        <div className="p-20 text-center">
                        <FileText className="w-12 h-12 text-olive-800 mx-auto mb-4" />
                        <p className="text-olive-500 font-medium italic">Nenhuma transação registrada ainda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-olive-900 border border-olive-800 rounded-3xl p-6 shadow-xl space-y-3">
                <h3 className="text-sm font-bold mb-2 uppercase tracking-widest text-olive-400">Ações Rápidas</h3>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                >
                  + NOVA RECEITA / DESPESA
                </button>
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="w-full py-4 bg-olive-600 hover:bg-olive-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-olive-900/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  IMPORTAÇÃO MOBILE IA
                </button>
                <div className="pt-4 mt-4 border-t border-olive-800">
                    <p className="text-[10px] text-olive-500 italic leading-snug">"Otimize seu tempo conciliando suas notificações bancárias diretamente com nossa IA."</p>
                </div>
            </div>

            {/* Hint Bento Item */}
            <div className="bg-olive-900 border border-olive-800 rounded-3xl p-6 shadow-xl bg-gradient-to-br from-olive-900 to-olive-900/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider">Dica do Sistema</h3>
                </div>
                <p className="text-xs text-olive-400 leading-relaxed italic">
                    Analise seu gráfico de despesas para identificar padrões de consumo. O planejamento mensal e metas estão na aba ao lado.
                </p>
            </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-olive-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-olive-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-olive-800"
            >
              <div className="p-8 border-b border-olive-800 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Nova Transação</h2>
                    <p className="text-[10px] text-olive-500 font-bold uppercase tracking-widest mt-1">Lançamento Manual</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-olive-800 rounded-full transition-colors text-olive-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleManualAdd} className="p-8 space-y-6">
                <div className="flex gap-4">
                  <label className="flex-1 group cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="income" 
                      checked={selectedType === 'income'} 
                      onChange={() => { setSelectedType('income'); setIsAddingNewCategory(false); }}
                      className="hidden peer" 
                    />
                    <div className="p-4 text-center rounded-2xl border-2 border-olive-800 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 transition-all font-bold text-olive-400 peer-checked:text-emerald-500 uppercase text-xs tracking-wider">Receita</div>
                  </label>
                  <label className="flex-1 group cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="expense" 
                      checked={selectedType === 'expense'}
                      onChange={() => { setSelectedType('expense'); setIsAddingNewCategory(false); }}
                      className="hidden peer" 
                    />
                    <div className="p-4 text-center rounded-2xl border-2 border-olive-800 peer-checked:border-rose-500 peer-checked:bg-rose-500/10 transition-all font-bold text-olive-400 peer-checked:text-rose-500 uppercase text-xs tracking-wider">Despesa</div>
                  </label>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-olive-500">Valor</label>
                       <input 
                         name="amount" 
                         type="number" 
                         step="0.01" 
                         required 
                         className="w-full bg-olive-800 border border-olive-700 rounded-2xl p-4 font-bold text-xl text-white focus:ring-2 focus:ring-olive-500 outline-none" 
                         placeholder="R$ 0,00" 
                         onChange={(e) => setTransactionAmount(Number(e.target.value))}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-olive-500">Data</label>
                       <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-olive-800 border border-olive-700 rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-olive-500 outline-none text-sm" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-olive-500">Categoria</label>
                        {!isAddingNewCategory ? (
                          <select 
                            name="category" 
                            className="w-full bg-olive-800 border border-olive-700 rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-olive-500 outline-none"
                            onChange={(e) => {
                              if (e.target.value === 'NEW') setIsAddingNewCategory(true);
                            }}
                          >
                              <option value="">Selecione...</option>
                              {filteredCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                              <option value="NEW" className="text-olive-400 font-black">+ NOVA CATEGORIA</option>
                          </select>
                        ) : (
                          <div className="flex gap-2">
                            <input 
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              className="flex-1 bg-olive-800 border border-olive-500/30 rounded-2xl p-4 font-bold text-white outline-none text-sm" 
                              placeholder="Nome da categoria"
                              autoFocus
                            />
                            <button 
                               type="button"
                               onClick={() => setIsAddingNewCategory(false)}
                               className="p-4 bg-olive-800 border border-olive-700 rounded-2xl text-olive-500 hover:text-white transition-colors"
                             >
                                <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-olive-500">Meio de Pagamento</label>
                        <select 
                          name="paymentMethod" 
                          className="w-full bg-olive-800 border border-olive-700 rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-olive-500 outline-none"
                          onChange={(e) => setSelectedMethod(e.target.value)}
                          value={selectedMethod}
                        >
                            <option value="Carteira">Carteira (Dinheiro)</option>
                            <option value="Banco">Banco (Conta Corrente)</option>
                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                        </select>
                    </div>
                  </div>

                  {selectedMethod === 'Banco' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 border-l-2 border-olive-500 pl-4 py-2 bg-olive-500/5 rounded-r-2xl"
                    >
                      <label className="text-[10px] font-bold uppercase tracking-widest text-olive-400">Gerenciar Conta</label>
                      {!isAddingNewAccount ? (
                        <select 
                          name="account" 
                          className="w-full bg-olive-800 border border-olive-700 rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-olive-500 outline-none"
                          onChange={(e) => {
                            if (e.target.value === 'NEW') setIsAddingNewAccount(true);
                          }}
                        >
                            <option value="">Selecione uma conta...</option>
                            {accounts.filter(a => a.type === 'Banco').map(acc => (
                              <option key={acc.id} value={acc.name}>{acc.name}</option>
                            ))}
                            <option value="NEW" className="text-olive-400 font-black">+ CADASTRAR NOVA CONTA</option>
                        </select>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                             <input 
                               value={newAccountName}
                               onChange={(e) => setNewAccountName(e.target.value)}
                               className="flex-1 bg-olive-800 border border-olive-500/30 rounded-2xl p-4 font-bold text-white outline-none" 
                               placeholder="Nome do Banco (Ex: Santander)" 
                               autoFocus
                             />
                             <button 
                               type="button"
                               onClick={() => setIsAddingNewAccount(false)}
                               className="p-4 bg-olive-800 border border-olive-700 rounded-2xl text-olive-500 hover:text-white transition-colors"
                             >
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                          <p className="text-[10px] text-olive-500 font-bold italic px-2">A conta será criada com saldo inicial R$ 0,00.</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {selectedMethod === 'Cartão de Crédito' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 border-l-2 border-rose-500 pl-4 py-2 bg-rose-500/5 rounded-r-2xl"
                    >
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Selecione o Cartão</label>
                        {!isAddingNewCC ? (
                          <select 
                            required
                            className="w-full bg-olive-800 border border-olive-700 rounded-2xl p-4 font-bold text-white outline-none text-sm"
                            value={selectedCC}
                            onChange={(e) => {
                              if (e.target.value === 'NEW') {
                                setIsAddingNewCC(true);
                              } else {
                                setSelectedCC(e.target.value);
                              }
                            }}
                          >
                              <option value="">Selecione um cartão...</option>
                              {creditCards.map(card => (
                                <option key={card.id} value={card.id}>
                                  {card.name} ({card.brand} •••• {card.lastDigits})
                                </option>
                              ))}
                              <option value="NEW" className="text-rose-400 font-black">+ CADASTRAR NOVO CARTÃO</option>
                          </select>
                        ) : (
                          <div className="space-y-4 bg-olive-900/50 p-4 rounded-2xl border border-rose-500/20">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase text-rose-400">Novo Cartão</span>
                              <button type="button" onClick={() => setIsAddingNewCC(false)} className="text-olive-500 hover:text-white">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <input 
                                placeholder="Nome (ex: Nubank)" 
                                className="bg-olive-800 border border-olive-700 rounded-xl p-3 text-xs text-white"
                                value={newCCName}
                                onChange={e => setNewCCName(e.target.value)}
                              />
                              <select 
                                className="bg-olive-800 border border-olive-700 rounded-xl p-3 text-xs text-white"
                                value={newCCBrand}
                                onChange={e => setNewCCBrand(e.target.value as any)}
                              >
                                <option value="Visa">Visa</option>
                                <option value="Mastercard">Mastercard</option>
                                <option value="Elo">Elo</option>
                                <option value="Amex">Amex</option>
                                <option value="Outro">Outro</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <input 
                                placeholder="Últimos 4 dígitos" 
                                maxLength={4}
                                className="bg-olive-800 border border-olive-700 rounded-xl p-3 text-xs text-white"
                                value={newCCDigits}
                                onChange={e => setNewCCDigits(e.target.value)}
                              />
                              <select 
                                className="bg-olive-800 border border-olive-700 rounded-xl p-3 text-xs text-white"
                                value={newCCBankAccountId}
                                onChange={e => setNewCCBankAccountId(e.target.value)}
                              >
                                <option value="">Vincular conta...</option>
                                {accounts.filter(a => a.type === 'Banco').map(acc => (
                                  <option key={acc.id} value={acc.name}>{acc.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-3">
                              <input 
                                type="number" 
                                placeholder="Limite Total" 
                                className="w-full bg-olive-800 border border-olive-700 rounded-xl p-3 text-xs text-white"
                                value={newCCLimit || ''}
                                onChange={e => setNewCCLimit(Number(e.target.value))}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <input 
                                  type="number" 
                                  placeholder="Dia Fechamento" 
                                  min="1" max="31"
                                  className="bg-olive-800 border border-olive-700 rounded-xl p-3 text-xs text-white"
                                  value={newCCClosingDay || ''}
                                  onChange={e => setNewCCClosingDay(Number(e.target.value))}
                                />
                                <input 
                                  type="number" 
                                  placeholder="Dia Vencimento" 
                                  min="1" max="31"
                                  className="bg-olive-800 border border-olive-700 rounded-xl p-3 text-xs text-white"
                                  value={newCCDueDay || ''}
                                  onChange={e => setNewCCDueDay(Number(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Parcelamento</label>
                        <select 
                          name="installments" 
                          className="w-full bg-olive-800 border border-olive-700 rounded-2xl p-4 font-bold text-white outline-none"
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                        >
                            {[1,2,3,4,5,6,7,8,9,10,12,18,24].map(n => (
                              <option key={n} value={n}>{n}x {n > 1 ? `de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transactionAmount / n)}` : ''}</option>
                            ))}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-olive-500">Descrição</label>
                    <input name="description" type="text" className="w-full bg-olive-800 border border-olive-700 rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-olive-500 outline-none" placeholder="Ex: Mercado mensal" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-olive-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-olive-700 transition-all shadow-xl shadow-olive-900/20 active:scale-95">
                  Salvar Transação
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-olive-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-olive-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-olive-800"
            >
              <div className="p-8 border-b border-olive-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white italic">Importação IA Mobile</h2>
                  <p className="text-[10px] text-olive-500 font-bold uppercase tracking-widest mt-1">Cole a notificação completa</p>
                </div>
                <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-olive-800 rounded-full transition-colors text-olive-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <textarea 
                  value={notificationText}
                  onChange={(e) => setNotificationText(e.target.value)}
                  className="w-full h-48 bg-olive-800 border border-olive-700 rounded-2xl p-6 font-medium text-white focus:ring-2 focus:ring-olive-500 outline-none resize-none leading-relaxed italic"
                  placeholder="Ex: Compra aprovada no valor de R$ 45,90 em IFood via Cartão Mastercard Final 1234..."
                ></textarea>

                <button 
                  onClick={handleImportNotification}
                  disabled={isParsing || !notificationText.trim()}
                  className="w-full bg-olive-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-olive-700 transition-all shadow-xl shadow-olive-900/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                >
                  {isParsing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      CONCILIANDO DADOS...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      CONCILIAR COM IA
                    </>
                  )}
                </button>
                <div className="p-4 bg-olive-950/50 rounded-xl border border-olive-800">
                    <p className="text-[10px] text-olive-500 italic text-center">Nossa IA analisa banco, valor e estabelecimento em milissegundos.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: number, icon: any, color: string, large?: boolean }> = ({ label, value, icon: Icon, color, large }) => {
  const isOlive = color === 'olive';
  const isOliveLight = color === 'olive-light';
  const isRose = color === 'rose';
  
  return (
    <div className={`p-8 rounded-[2rem] border overflow-hidden relative shadow-xl transition-all h-full flex flex-col justify-between ${
      isOlive ? 'bg-olive-900 border-olive-800' : 
      isOliveLight ? 'bg-olive-500/5 border-olive-500/10' : 
      'bg-rose-500/5 border-rose-500/10'
    }`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isOlive ? 'text-olive-400' : isOliveLight ? 'text-olive-400' : 'text-rose-400'}`}>{label}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isOlive ? 'bg-olive-600/20 text-olive-400' : isOliveLight ? 'bg-olive-500/20 text-olive-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
                <Icon className="w-4 h-4" />
            </div>
        </div>
        <p className={`${large ? 'text-4xl' : 'text-2xl'} font-bold tracking-tighter text-white`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(value))}
        </p>
      </div>
      
      {large && (
        <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="h-1 bg-olive-800 rounded-full overflow-hidden">
                <div className="h-full bg-olive-500 w-3/4"></div>
             </div>
             <div className="h-1 bg-olive-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-1/2"></div>
             </div>
        </div>
      )}

      {/* Decorative background element */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-5 blur-2xl ${
        isOlive ? 'bg-olive-600' : isOliveLight ? 'bg-olive-600' : 'bg-rose-600'
      }`}></div>
    </div>
  );
};
