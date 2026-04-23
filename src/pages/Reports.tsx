import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area 
} from 'recharts';
import { db, Transaction } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { TrendingUp, TrendingDown, Wallet, Calendar, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Reports: React.FC = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!user) return;
    
    // For admin, we might want to see all users, but here let's start with user's own data
    // Admin dashboard already handles some listing. Let's make this page personal.
    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'));
    
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
    });

    return unsub;
  }, [user]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.keys(categories).map(name => ({ name, value: categories[name] }));
  }, [transactions]);

  const monthlyFlowData = useMemo(() => {
    const months: Record<string, { income: number, expense: number }> = {};
    transactions.forEach(t => {
      const month = t.date?.seconds ? format(new Date(t.date.seconds * 1000), 'MMM', { locale: ptBR }) : '';
      if (!months[month]) months[month] = { income: 0, expense: 0 };
      if (t.type === 'income') months[month].income += t.amount;
      else months[month].expense += t.amount;
    });
    return Object.keys(months).reverse().map(name => ({ name, ...months[name] }));
  }, [transactions]);

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-10 pb-20">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative group">
           <div className="relative z-10">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Eficiência de Caixa</h3>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-black text-white italic">Fluxo de Caixa</p>
                <div className="mb-2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
              </div>
              <p className="text-xs text-slate-400 mt-4 max-w-xs italic leading-relaxed">Seu resumo consolidado de entradas e saídas processadas pela nossa engine financeira.</p>
           </div>
           <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-600/20 transition-all duration-700"></div>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] shadow-xl">
           <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
           </div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Total Receitas</p>
           <p className="text-2xl font-black text-white">
             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0))}
           </p>
        </div>

        <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-[2rem] shadow-xl">
           <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingDown className="w-5 h-5 text-rose-400" />
           </div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1">Total Despesas</p>
           <p className="text-2xl font-black text-white">
             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0))}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 italic">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Variação Mensal
              </h3>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Receitas</span>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Despesas</span>
                 </div>
              </div>
           </div>
           
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyFlowData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    cursor={{ stroke: '#334155', strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} strokeLinecap="round" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} strokeLinecap="round" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-1 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
           <h3 className="text-lg font-bold text-white mb-10 flex items-center gap-3 italic">
             <Filter className="w-5 h-5 text-indigo-400" />
             Mix de Despesas
           </h3>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>
           
           <div className="mt-6 space-y-3">
              {categoryData.slice(0, 4).map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-xs font-bold text-slate-400 capitalize">{cat.name}</span>
                   </div>
                   <span className="text-xs font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.value)}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
