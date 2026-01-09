
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
  }));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-red-50">
      {/* Header Minimalista */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 text-white p-2.5 rounded-xl shadow-lg shadow-red-50">
              <Calculator size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">
                Simulador Salarial <span className="text-red-600">UGT</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Horizonte de Recuperación 2024—2028</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Consolidable
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-red-600"></div> Pactado
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sidebar: Configuración */}
        <aside className="lg:col-span-4 space-y-10">
          <div className="space-y-10">
            <section>
              <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <TrendingUp size={14} className="text-red-600" /> Configuración Inicial
              </h2>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sueldo Bruto Mensual (2024)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">€</span>
                    <input 
                      type="number" 
                      value={inputs.baseMonthlySalary2024}
                      onChange={(e) => setInputs(prev => ({ ...prev, baseMonthlySalary2024: Number(e.target.value) }))}
                      className="w-full pl-11 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all outline-none font-black text-3xl text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Número de Pagas</label>
                  <div className="flex gap-3">
                    {[12, 14].map(num => (
                      <button
                        key={num}
                        onClick={() => setInputs(prev => ({ ...prev, numPayments: num as 12 | 14 }))}
                        className={`flex-1 py-4 rounded-xl border-2 font-black transition-all ${
                          inputs.numPayments === num 
                          ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' 
                          : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200 hover:text-slate-500'
                        }`}
                      >
                        {num} Pagas
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => setInputs(prev => ({ ...prev, includeVariable2026: !prev.includeVariable2026 }))}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                      inputs.includeVariable2026 
                      ? 'bg-blue-50/50 border-blue-100' 
                      : 'bg-slate-50 border-slate-50 opacity-60'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${inputs.includeVariable2026 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {inputs.includeVariable2026 && <CheckCircle2 size={14} strokeWidth={3} />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Incluir Cláusula IPC</p>
                      <p className="text-[10px] text-slate-400 font-medium">+0,5% variable anual</p>
                    </div>
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
                <ShieldCheck size={140} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4">Garantía de Consolidación</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                Todas las subidas pactadas se <strong className="text-white">integran de forma fija</strong> en el sueldo base y complementos, asegurando el futuro de tu jubilación.
              </p>
              <a 
                href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-1815" 
                target="_blank" 
                className="flex items-center justify-between w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all"
              >
                Ver RDL 14/2025 en BOE <ExternalLink size={14} />
              </a>
            </section>
          </div>
        </aside>

        {/* Resultados: Flujo Principal */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Impacto Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 mb-6">
                <ArrowUpRight size={28} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Mejora Mensual 2028</p>
              <h4 className="text-5xl font-black text-slate-900 tracking-tighter">
                +{formatCurrency(finalData.monthlyTotal - baselineData.monthlyTotal)}
              </h4>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="bg-red-50 p-4 rounded-2xl text-red-600 mb-6">
                <Wallet size={28} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Acumulado Anual Bruto</p>
              <h4 className="text-5xl font-black text-slate-900 tracking-tighter">
                +{formatCurrency(finalData.annualTotal - baselineData.annualTotal)}
              </h4>
            </div>
          </div>

          {/* Listado de Años */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
              <Calendar size={14} /> Progresión del Acuerdo
            </h3>

            <div className="space-y-6">
              {calculations.map((yearData, idx) => {
                const yearInfo = BOE_DATA.YEARS.find(y => y.year === yearData.year);
                const isBaseline = idx === 0;
                
                return (
                  <div key={yearData.year} className={`relative flex flex-col md:flex-row items-stretch bg-white border rounded-[2rem] transition-all duration-300 ${
                    isBaseline ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/20'
                  }`}>
                    {/* Año y Etiqueta */}
                    <div className="p-8 md:w-32 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-slate-50">
                      <span className={`text-4xl font-black tracking-tighter ${isBaseline ? 'text-slate-300' : 'text-slate-900'}`}>{yearData.year}</span>
                      {idx > 0 && (
                        <span className={`mt-2 text-[8px] font-black px-2 py-0.5 rounded uppercase ${yearInfo?.isConfirmed ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {yearInfo?.isConfirmed ? 'Pactado' : 'Objetivo'}
                        </span>
                      )}
                    </div>

                    {/* Porcentajes: Distribución Espaciosa */}
                    <div className="flex-1 p-8 flex items-center">
                      {!isBaseline ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Incremento Fijo</span>
                            <p className="text-xl font-black text-slate-800">+{ (yearInfo?.fixed ?? 0) * 100 }%</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">IPC Variable</span>
                            <p className="text-xl font-black text-blue-500">+{ inputs.includeVariable2026 ? (yearInfo?.variable ?? 0) * 100 : '0' }%</p>
                          </div>
                          <div className="space-y-1 hidden sm:block">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Anual</span>
                            <p className="text-xl font-black text-slate-400">+{yearData.totalPercentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Situación base previa al acuerdo</p>
                      )}
                    </div>

                    {/* Valor Económico: Cápsula Final */}
                    <div className="p-8 md:w-56 bg-slate-50/30 rounded-r-[2rem] flex flex-col justify-center items-center md:items-end">
                      {idx > 0 ? (
                        <div className="text-center md:text-right">
                          <div className="flex items-center gap-1.5 justify-center md:justify-end mb-1 text-emerald-600">
                            <Plus size={12} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Mejora Mensual</span>
                          </div>
                          <p className="text-3xl font-black text-slate-900 mb-1">{formatCurrency(yearData.differenceMonthly)}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Sueldo: {formatCurrency(yearData.monthlyTotal)}</p>
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-300">{formatCurrency(yearData.monthlyTotal)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico Visual */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2 mb-12">
              <BarChart3 size={16} className="text-red-600" /> Curva de Recuperación Bruta (Anual)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#CBD5E1', fontSize: 12, fontWeight: 900 }} 
                    dy={10}
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9', radius: 12 }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Total Bruto']}
                  />
                  <Bar dataKey="Anual" radius={[8, 8, 8, 8]} barSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#F1F5F9' : COLORS.PRIMARY} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-100 mt-12">
        <div className="flex flex-col items-center gap-8 text-center">
          <img src="https://www.ugt.es/sites/default/files/ugt_logo_0.png" alt="UGT" className="h-10 grayscale opacity-20" />
          <p className="text-[11px] text-slate-300 font-medium leading-relaxed max-w-2xl">
            Simulador informativo basado en el Real Decreto-ley 14/2025. Los cálculos reflejan importes brutos. El resultado neto final dependerá de la situación fiscal de cada trabajador. Las previsiones 2027-2028 corresponden a la plataforma reivindicativa de UGT.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
