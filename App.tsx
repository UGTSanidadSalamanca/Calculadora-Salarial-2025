
import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  CheckCircle2, 
  BarChart3,
  Calendar,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  Target,
  Info,
  Plus,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { BOE_DATA, COLORS } from './constants.tsx';
import { CalculationInputs, SalaryBreakdown } from './types.ts';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    baseMonthlySalary2024: 2000,
    numPayments: 14,
    includeVariable2026: true
  });

  const [viewMode, setViewMode] = useState<'both' | 'monthly' | 'annual'>('both');

  const calculations = useMemo(() => {
    const results: SalaryBreakdown[] = [];
    const baseAnnual2024 = inputs.baseMonthlySalary2024 * inputs.numPayments;

    results.push({
      year: 2024,
      fixedIncrease: 0,
      variableIncrease: 0,
      totalPercentage: 0,
      annualTotal: baseAnnual2024,
      monthlyTotal: inputs.baseMonthlySalary2024,
      differenceAnnual: 0,
      differenceMonthly: 0
    });

    let currentAnnual = baseAnnual2024;
    
    BOE_DATA.YEARS.forEach((yearInfo) => {
      const varInc = inputs.includeVariable2026 ? yearInfo.variable : 0;
      const totalInc = yearInfo.fixed + varInc;
      const previousAnnual = currentAnnual;
      
      currentAnnual = currentAnnual * (1 + totalInc);
      
      results.push({
        year: yearInfo.year,
        fixedIncrease: yearInfo.fixed,
        variableIncrease: varInc,
        totalPercentage: totalInc * 100,
        annualTotal: currentAnnual,
        monthlyTotal: currentAnnual / inputs.numPayments,
        differenceAnnual: currentAnnual - previousAnnual,
        differenceMonthly: (currentAnnual / inputs.numPayments) - (previousAnnual / inputs.numPayments)
      });
    });

    return results;
  }, [inputs]);

  const finalData = calculations[calculations.length - 1];
  const baselineData = calculations[0];

  const chartData = calculations.map(c => ({
    name: `${c.year}`,
    Anual: parseFloat(c.annualTotal.toFixed(2)),
    Mensual: parseFloat(c.monthlyTotal.toFixed(2)),
    isConfirmed: BOE_DATA.YEARS.find(y => y.year === c.year)?.isConfirmed ?? true
  }));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans selection:bg-red-100 selection:text-red-700">
      {/* Header Glassmorphism */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 text-white p-2.5 rounded-2xl shadow-lg shadow-red-100 flex items-center justify-center">
              <Calculator size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Simulador <span className="text-red-600">UGT</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Acuerdo Salarial 2024—2028</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['both', 'monthly', 'annual'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2 text-[11px] font-black rounded-lg transition-all duration-300 ${
                  viewMode === mode 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {mode === 'both' ? 'GENERAL' : mode === 'monthly' ? 'MENSUAL' : 'ANUAL'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sidebar de Configuración */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-10">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <TrendingUp size={14} className="text-red-600" /> Parámetros
            </h2>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sueldo Bruto 2024</label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl transition-colors group-focus-within:text-red-400">€</span>
                  <input 
                    type="number" 
                    value={inputs.baseMonthlySalary2024}
                    onChange={(e) => setInputs(prev => ({ ...prev, baseMonthlySalary2024: Number(e.target.value) }))}
                    className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all outline-none font-black text-3xl text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Pagas anuales</label>
                <div className="flex gap-3">
                  {[12, 14].map(num => (
                    <button
                      key={num}
                      onClick={() => setInputs(prev => ({ ...prev, numPayments: num as 12 | 14 }))}
                      className={`flex-1 py-4 rounded-xl border-2 font-black transition-all ${
                        inputs.numPayments === num 
                        ? 'bg-red-50 border-red-500 text-red-600 shadow-sm shadow-red-100' 
                        : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200 hover:text-slate-500'
                      }`}
                    >
                      {num} Pagas
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={() => setInputs(prev => ({ ...prev, includeVariable2026: !prev.includeVariable2026 }))}
                  className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                    inputs.includeVariable2026 
                    ? 'bg-blue-50/50 border-blue-200' 
                    : 'bg-slate-50 border-slate-100 opacity-60'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${inputs.includeVariable2026 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {inputs.includeVariable2026 && <CheckCircle2 size={14} strokeWidth={3} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Variable IPC (+0,5%)</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Incluir cláusula de inflación</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110 duration-700">
              <ShieldCheck size={160} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4 flex items-center gap-2">
              <ShieldCheck size={14} /> Garantía UGT
            </h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
              Cada subida pactada se <strong className="text-white">consolida permanentemente</strong> en tu sueldo base y complementos.
            </p>
            <a 
              href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-1815" 
              target="_blank" 
              className="inline-flex items-center gap-2 text-xs font-black text-white bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl transition-all"
            >
              BOE Referencia <ExternalLink size={12} />
            </a>
          </div>
        </aside>

        {/* Contenido Principal */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
              <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 mb-6">
                <ArrowUpRight size={32} strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Incremento Mensual Neto</p>
              <h4 className="text-5xl font-black text-slate-900 tracking-tighter">
                +{formatCurrency(finalData.monthlyTotal - baselineData.monthlyTotal)}
              </h4>
              <p className="mt-4 text-[11px] font-bold text-emerald-600 bg-emerald-100/50 px-4 py-1 rounded-full uppercase">Poder Adquisitivo 2028</p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
              <div className="bg-red-50 p-4 rounded-2xl text-red-600 mb-6">
                <Wallet size={32} strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Mejora Bruta Anual</p>
              <h4 className="text-5xl font-black text-slate-900 tracking-tighter">
                +{formatCurrency(finalData.annualTotal - baselineData.annualTotal)}
              </h4>
              <p className="mt-4 text-[11px] font-bold text-red-600 bg-red-100/50 px-4 py-1 rounded-full uppercase tracking-tighter">Acumulado consolidado</p>
            </div>
          </div>

          {/* Timeline de subidas */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 ml-4">
              <Calendar size={14} /> Desglose por ejercicios
            </h3>

            <div className="space-y-4">
              {calculations.map((yearData, idx) => {
                const yearInfo = BOE_DATA.YEARS.find(y => y.year === yearData.year);
                const isBaseline = idx === 0;
                
                return (
                  <div key={yearData.year} className={`group flex flex-col md:flex-row items-center bg-white border rounded-3xl p-6 transition-all duration-300 ${
                    isBaseline ? 'opacity-50 border-slate-100' : 'border-slate-200/60 hover:shadow-md hover:border-slate-300'
                  }`}>
                    {/* Año */}
                    <div className="flex items-center gap-4 min-w-[120px] border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6 mb-4 md:mb-0">
                      <span className={`text-4xl font-black tracking-tighter ${isBaseline ? 'text-slate-300' : 'text-slate-900'}`}>{yearData.year}</span>
                      {idx > 0 && (
                        <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${yearInfo?.isConfirmed ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {yearInfo?.isConfirmed ? 'BOE' : 'OBJ'}
                        </div>
                      )}
                    </div>

                    {/* Porcentajes con Espaciado Vital */}
                    <div className="flex-1 px-0 md:px-8 py-4 md:py-0 w-full">
                      {!isBaseline && (
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subida Fija</span>
                            <span className="text-xl font-black text-slate-800">+{ (yearInfo?.fixed ?? 0) * 100 }%</span>
                          </div>
                          <div className="hidden sm:block w-px h-6 bg-slate-100"></div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Variable IPC</span>
                            <span className="text-xl font-black text-blue-500">+{ inputs.includeVariable2026 ? (yearInfo?.variable ?? 0) * 100 : '0' }%</span>
                          </div>
                          <div className="w-px h-6 bg-slate-100"></div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-right">Acumulado</span>
                            <span className="text-xl font-black text-slate-400 text-right">+{yearData.totalPercentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      )}
                      {isBaseline && <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">Punto de referencia inicial</p>}
                    </div>

                    {/* Mejora Económica - Cápsula Clara */}
                    <div className="min-w-[180px] flex flex-col items-end pt-4 md:pt-0">
                      {idx > 0 ? (
                        <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                            Mejora/mes <Plus size={10} strokeWidth={4} />
                          </p>
                          <div className="bg-emerald-50 px-5 py-2 rounded-2xl border border-emerald-100/50">
                            <span className="text-2xl font-black text-slate-900">{formatCurrency(yearData.differenceMonthly)}</span>
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Total: {formatCurrency(yearData.monthlyTotal)}</p>
                        </div>
                      ) : (
                        <div className="text-right opacity-30">
                          <p className="text-[10px] font-black uppercase mb-1">Base 2024</p>
                          <span className="text-xl font-black">{formatCurrency(yearData.monthlyTotal)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                <BarChart3 size={16} className="text-red-600" /> Proyección visual
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-slate-100"></div> Inicial
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div> Consolidado
                </div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 900 }} 
                    dy={15}
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC', radius: 10 }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Sueldo']}
                  />
                  <Bar dataKey={viewMode === 'monthly' ? 'Mensual' : 'Anual'} radius={[8, 8, 8, 8]} barSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#F1F5F9' : entry.isConfirmed ? COLORS.PRIMARY : '#CBD5E1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-white border border-slate-100 p-12 rounded-[3rem] text-center">
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic max-w-3xl mx-auto">
            * Este simulador tiene un propósito exclusivamente informativo. Los cálculos muestran importes brutos aproximados antes de retenciones (IRPF) y cotizaciones. Las previsiones para 2027 y 2028 se basan en la hoja de ruta sindical de UGT para la recuperación del poder adquisitivo perdido.
          </p>
          <div className="mt-8 flex justify-center items-center gap-6">
             <div className="h-px w-12 bg-slate-100"></div>
             <img src="https://www.ugt.es/sites/default/files/ugt_logo_0.png" alt="UGT" className="h-8 grayscale opacity-30" />
             <div className="h-px w-12 bg-slate-100"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
