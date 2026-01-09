
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
  ChevronRight,
  Info
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
      {/* Header Slim */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-1.5 rounded-lg">
              <Calculator size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-sm font-black tracking-tight uppercase">
              Simulador <span className="text-red-600">UGT</span>
            </h1>
          </div>
          <a href="https://www.ugt.es" target="_blank" className="opacity-40 hover:opacity-100 transition-opacity">
            <img src="https://www.ugt.es/sites/default/files/ugt_logo_0.png" alt="UGT" className="h-6" />
          </a>
        </div>
      </header>

      {/* HERO SECTION: Dashboard de Impacto */}
      <section className="bg-slate-900 pt-12 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Acuerdo Consolidado 2025-2028</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-none">
                Tu nómina crecerá <br />
                <span className="text-emerald-400">+{formatCurrency(finalData.monthlyTotal - baselineData.monthlyTotal)}</span> al mes
              </h2>
              <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
                Calcula el impacto real del acuerdo firmado por UGT. 
                Sube tu sueldo base y descubre tu nueva retribución consolidada.
              </p>
            </div>
            
            <div className="lg:col-span-5">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Sueldo Bruto Actual (Mensual)</label>
                    <div className="relative group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-2xl group-focus-within:text-red-500 transition-colors">€</span>
                      <input 
                        type="number" 
                        value={inputs.baseMonthlySalary2024}
                        onChange={(e) => setInputs(prev => ({ ...prev, baseMonthlySalary2024: Number(e.target.value) }))}
                        className="w-full pl-12 pr-6 py-6 bg-white/10 border border-white/10 rounded-2xl focus:bg-white focus:text-slate-900 transition-all outline-none font-black text-4xl text-white shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Pagas</label>
                      <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                        {[12, 14].map(num => (
                          <button
                            key={num}
                            onClick={() => setInputs(prev => ({ ...prev, numPayments: num as 12 | 14 }))}
                            className={`flex-1 py-2 rounded-lg font-black text-xs transition-all ${
                              inputs.numPayments === num ? 'bg-white text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Variable IPC</label>
                      <button 
                        onClick={() => setInputs(prev => ({ ...prev, includeVariable2026: !prev.includeVariable2026 }))}
                        className={`w-full py-2.5 rounded-xl border font-black text-xs transition-all flex items-center justify-center gap-2 ${
                          inputs.includeVariable2026 ? 'bg-blue-500 border-blue-400 text-white' : 'bg-white/5 border-white/5 text-slate-400'
                        }`}
                      >
                        {inputs.includeVariable2026 ? <CheckCircle2 size={12} /> : null}
                        {inputs.includeVariable2026 ? 'ACTIVO (+0.5%)' : 'DESACTIVAR'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 -mt-12 mb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Listado de Progresión */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                 <Calendar size={14} className="text-red-600" /> Detalle por Ejercicios
               </h3>
               <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-600"></div> Pactado</span>
                 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200"></div> Estimado</span>
               </div>
            </div>

            <div className="space-y-6">
              {calculations.map((yearData, idx) => {
                const yearInfo = BOE_DATA.YEARS.find(y => y.year === yearData.year);
                const isBaseline = idx === 0;
                
                return (
                  <div key={yearData.year} className={`group bg-white border rounded-[2.5rem] p-2 transition-all duration-500 ${
                    isBaseline ? 'border-slate-100 opacity-60 scale-95' : 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Año Bubble */}
                      <div className={`flex flex-col items-center justify-center p-6 md:w-32 rounded-[2.2rem] ${
                        isBaseline ? 'bg-slate-50 text-slate-300' : 'bg-slate-900 text-white shadow-lg'
                      }`}>
                        <span className="text-3xl font-black tracking-tighter leading-none">{yearData.year}</span>
                        {!isBaseline && <span className="text-[8px] font-bold uppercase mt-1 tracking-widest text-red-500">Acuerdo</span>}
                      </div>

                      {/* Datos de Porcentaje */}
                      <div className="flex-1 px-6 py-4 grid grid-cols-2 md:grid-cols-3 gap-6">
                        {!isBaseline ? (
                          <>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Subida Base</p>
                              <p className="text-xl font-black text-slate-800">+{ (yearInfo?.fixed ?? 0) * 100 }%</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Plus IPC</p>
                              <p className={`text-xl font-black ${inputs.includeVariable2026 ? 'text-blue-500' : 'text-slate-300'}`}>
                                +{ inputs.includeVariable2026 ? (yearInfo?.variable ?? 0) * 100 : '0' }%
                              </p>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Acumulado</p>
                              <p className="text-xl font-black text-slate-400">+{yearData.totalPercentage.toFixed(1)}%</p>
                            </div>
                          </>
                        ) : (
                          <p className="col-span-full text-xs font-bold text-slate-300 uppercase tracking-widest">Estado previo a la negociación</p>
                        )}
                      </div>

                      {/* Resultado Económico */}
                      <div className={`p-6 md:w-64 rounded-[2.2rem] text-right flex flex-col justify-center ${
                        isBaseline ? 'bg-slate-50' : 'bg-emerald-50 border border-emerald-100'
                      }`}>
                        {idx > 0 ? (
                          <>
                            <div className="flex items-center gap-1.5 justify-end text-emerald-600 mb-1">
                              <Plus size={12} strokeWidth={4} />
                              <span className="text-[9px] font-black uppercase tracking-wider">Mejora Mensual</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{formatCurrency(yearData.differenceMonthly)}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Total: {formatCurrency(yearData.monthlyTotal)}</p>
                          </>
                        ) : (
                          <p className="text-xl font-black text-slate-400">{formatCurrency(yearData.monthlyTotal)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widgets Laterales */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                 <BarChart3 size={16} className="text-red-600" /> Proyección Anual
               </h3>
               <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#CBD5E1', fontSize: 10, fontWeight: 900 }} dy={10} />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC', radius: 12 }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(v: number) => [formatCurrency(v), 'Total']}
                    />
                    <Bar dataKey="Anual" radius={[6, 6, 6, 6]} barSize={32}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#F1F5F9' : COLORS.PRIMARY} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
                <ShieldCheck size={140} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck size={14} /> Garantía Jurídica
              </h4>
              <p className="text-sm font-medium leading-relaxed mb-6">
                Este incremento es <strong className="text-white">consolidable</strong>, lo que significa que formará parte permanente de tu base de cotización para tu futura jubilación.
              </p>
              <a 
                href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-1815" 
                target="_blank" 
                className="inline-flex items-center gap-2 text-[10px] font-black bg-white text-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors uppercase tracking-widest"
              >
                Referencia BOE <ExternalLink size={10} />
              </a>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center gap-8">
          <div className="flex items-center gap-4 opacity-30 grayscale">
            <div className="h-px w-12 bg-slate-300"></div>
            <img src="https://www.ugt.es/sites/default/files/ugt_logo_0.png" alt="UGT" className="h-8" />
            <div className="h-px w-12 bg-slate-300"></div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <Info size={14} className="text-blue-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Simulador Sindical Actualizado — v2.0</p>
          </div>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-2xl">
            Simulador basado en el Real Decreto-ley 14/2025 de medidas urgentes para la función pública. 
            Los cálculos son estimaciones brutas. El neto real dependerá de la situación fiscal de cada trabajador. 
            Los hitos 2027 y 2028 corresponden a la plataforma de negociación de UGT para la recuperación del poder adquisitivo.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
