
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
  Info,
  Star,
  History,
  Coins
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
    baseMonthlySalary2025: 2050,
    numPayments: 14,
    includeVariable2026: true
  });

  const calculations = useMemo(() => {
    const results: SalaryBreakdown[] = [];
    
    // 1. Calculamos el sueldo de 2025 como BASE
    const annual2025 = inputs.baseMonthlySalary2025 * inputs.numPayments;
    
    // Factor de subida de 2025 (2% + 0.5%)
    const factor2025 = 1 + (BOE_DATA.YEARS[0].fixed + BOE_DATA.YEARS[0].variable);
    const annual2024 = annual2025 / factor2025;

    // 2024: Referencia
    results.push({
      year: 2024,
      fixedIncrease: 0,
      variableIncrease: 0,
      totalPercentage: 0,
      annualTotal: annual2024,
      monthlyTotal: annual2024 / inputs.numPayments,
      differenceAnnual: 0,
      differenceMonthly: 0
    });

    // 2025: Con bolsa de atrasos
    results.push({
      year: 2025,
      fixedIncrease: BOE_DATA.YEARS[0].fixed,
      variableIncrease: BOE_DATA.YEARS[0].variable,
      totalPercentage: (factor2025 - 1) * 100,
      annualTotal: annual2025,
      monthlyTotal: inputs.baseMonthlySalary2025,
      differenceAnnual: annual2025 - annual2024,
      differenceMonthly: inputs.baseMonthlySalary2025 - (annual2024 / inputs.numPayments)
    });

    // 2026 en adelante
    let currentAnnual = annual2025;
    BOE_DATA.YEARS.slice(1).forEach((yearInfo) => {
      const varInc = (yearInfo.year === 2026 && !inputs.includeVariable2026) ? 0 : yearInfo.variable;
      const totalInc = yearInfo.fixed + varInc;
      const previousAnnual = currentAnnual;
      
      currentAnnual = currentAnnual * (1 + totalInc);
      
      results.push({
        year: yearInfo.year,
        fixedIncrease: yearInfo.fixed,
        variableIncrease: varInc,
        totalPercentage: ((currentAnnual / annual2024) - 1) * 100,
        annualTotal: currentAnnual,
        monthlyTotal: currentAnnual / inputs.numPayments,
        differenceAnnual: currentAnnual - previousAnnual,
        differenceMonthly: (currentAnnual / inputs.numPayments) - (previousAnnual / inputs.numPayments)
      });
    });

    return results;
  }, [inputs]);

  const data2025 = calculations.find(d => d.year === 2025)!;
  const data2026 = calculations.find(d => d.year === 2026)!;
  const baseline2024 = calculations[0];

  // Cálculo de atrasos: La diferencia de 2025 acumulada en todo el año (suponiendo pago en dic)
  const atrasos2025 = data2025.differenceMonthly * inputs.numPayments;

  const chartData = calculations.map(c => ({
    name: `${c.year}`,
    Anual: parseFloat(c.annualTotal.toFixed(2)),
    Mensual: parseFloat(c.monthlyTotal.toFixed(2)),
  }));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-red-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-1.5 rounded-lg shadow-sm">
              <Calculator size={18} strokeWidth={2.5} />
            </div>
            <h1 className="text-xs font-black tracking-tight uppercase">
              Simulador <span className="text-red-600">Salarial 2026</span>
            </h1>
          </div>
          <img src="https://www.ugt.es/sites/default/files/logo_policromo_header_ugt.png" alt="UGT" className="h-10 opacity-90" />
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-slate-900 pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/10 blur-[120px] rounded-full"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <Star size={10} className="text-emerald-400 fill-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Nómina 2026 Consolidada</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <Coins size={10} className="text-amber-400" />
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Atrasos Calculados</span>
                </div>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-none">
                Tu nómina crece <br />
                <span className="text-emerald-400">+{formatCurrency(data2026.differenceMonthly)}</span>/mes
              </h2>
              <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
                Referencia actualizada según BOE de diciembre 2025. Introduce tu sueldo bruto de 2025 para conocer tu nueva nómina y la bolsa de atrasos.
              </p>
            </div>
            
            <div className="lg:col-span-5">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                      <History size={12} /> Tu Sueldo Mensual Bruto (2025)
                    </label>
                    <div className="relative group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-2xl group-focus-within:text-red-500 transition-colors">€</span>
                      <input 
                        type="number" 
                        value={inputs.baseMonthlySalary2025}
                        onChange={(e) => setInputs(prev => ({ ...prev, baseMonthlySalary2025: Number(e.target.value) }))}
                        className="w-full pl-12 pr-6 py-6 bg-white/10 border border-white/10 rounded-2xl focus:bg-white focus:text-slate-900 transition-all outline-none font-black text-4xl text-white shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Nº Pagas</label>
                      <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                        {[12, 14].map(num => (
                          <button
                            key={num}
                            onClick={() => setInputs(prev => ({ ...prev, numPayments: num as 12 | 14 }))}
                            className={`flex-1 py-2 rounded-lg font-black text-xs transition-all ${
                              inputs.numPayments === num ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Variable IPC 26</label>
                      <button 
                        onClick={() => setInputs(prev => ({ ...prev, includeVariable2026: !prev.includeVariable2026 }))}
                        className={`w-full py-2.5 rounded-xl border font-black text-[10px] transition-all flex items-center justify-center gap-2 ${
                          inputs.includeVariable2026 ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/5 text-slate-400'
                        }`}
                      >
                        {inputs.includeVariable2026 ? 'SI (+0,5%)' : 'PENDIENTE'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 -mt-12 mb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              {calculations.map((yearData, idx) => {
                const is2026 = yearData.year === 2026;
                const isBaseline = yearData.year === 2024;
                const isInputYear = yearData.year === 2025;
                
                return (
                  <div key={yearData.year} className={`group bg-white border rounded-[2.5rem] p-3 transition-all duration-500 ${
                    is2026 ? 'border-emerald-200 shadow-2xl shadow-emerald-200/20 ring-2 ring-emerald-500/10' : 
                    isBaseline ? 'border-slate-50 bg-slate-50/50' : 'border-slate-100 shadow-sm'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Año Bubble - Corregido solapamiento */}
                      <div className={`flex flex-col items-center justify-center py-5 px-6 md:w-36 rounded-[2.2rem] shrink-0 transition-colors ${
                        isBaseline ? 'bg-slate-200 text-slate-500' : 
                        is2026 ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        <span className="text-3xl font-black tracking-tighter leading-none">{yearData.year}</span>
                        <span className="text-[8px] font-bold uppercase mt-1.5 tracking-widest opacity-80 text-center">
                          {isBaseline ? 'HISTÓRICO' : is2026 ? 'AÑO ACTUAL' : isInputYear ? 'BASE CALC.' : 'PREVISIÓN'}
                        </span>
                      </div>

                      <div className="flex-1 px-4 py-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {!isBaseline ? (
                          <>
                            <div className="flex flex-col justify-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 text-ellipsis overflow-hidden">Incremento</p>
                              <p className="text-lg font-black text-slate-800 leading-tight">+{yearData.year === 2025 ? '2,5' : (yearData.fixedIncrease + (yearData.year === 2026 && inputs.includeVariable2026 ? yearData.variableIncrease : 0)) * 100}%</p>
                            </div>
                            <div className="flex flex-col justify-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Acumulado</p>
                              <p className="text-lg font-black text-blue-600 leading-tight">+{yearData.totalPercentage.toFixed(1)}%</p>
                            </div>
                            <div className="hidden md:flex flex-col justify-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Situación</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                {yearData.year <= 2026 ? <CheckCircle2 size={12} className="text-emerald-500" /> : <History size={12} />}
                                {yearData.year <= 2026 ? 'Consolidado' : 'Propuesta'}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="col-span-full flex items-center">
                             <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest italic">Punto de partida previo al Acuerdo de Modernización</p>
                          </div>
                        )}
                      </div>

                      <div className={`p-6 md:w-64 rounded-[2.2rem] text-right flex flex-col justify-center shrink-0 ${
                        is2026 ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-transparent'
                      }`}>
                        {!isBaseline ? (
                          <>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mensual Bruto</p>
                            <p className={`text-2xl font-black tracking-tighter leading-none ${is2026 ? 'text-emerald-700' : 'text-slate-900'}`}>
                              {formatCurrency(yearData.monthlyTotal)}
                            </p>
                            <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase">+{formatCurrency(yearData.differenceMonthly)} / mes</p>
                          </>
                        ) : (
                          <p className="text-lg font-black text-slate-400">{formatCurrency(yearData.monthlyTotal)}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Sección de Atrasos dentro de 2025 */}
                    {isInputYear && (
                      <div className="mt-2 bg-amber-50 border border-amber-100 rounded-[1.5rem] p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                             <Coins size={16} />
                           </div>
                           <div>
                             <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Bolsa de Atrasos 2025</p>
                             <p className="text-[9px] text-amber-700 font-medium">Pago único retroactivo estimado por la subida del 2,5%</p>
                           </div>
                         </div>
                         <p className="text-xl font-black text-amber-600">{formatCurrency(atrasos2025)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            {/* Widget Atrasos Destacado */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-amber-200/50 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Coins size={160} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Coins size={14} /> Retroactividad 2025
              </h4>
              <p className="text-3xl font-black tracking-tighter mb-2">{formatCurrency(atrasos2025)}</p>
              <p className="text-xs font-medium opacity-90 leading-relaxed">
                Este es el importe bruto que te corresponde por la aplicación retroactiva de la subida de 2025 (desde enero).
              </p>
              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Concepto: Atrasos BOE-A-2025-24445</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                 <BarChart3 size={16} className="text-red-600" /> Progresión Nómina
               </h3>
               <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#CBD5E1', fontSize: 10, fontWeight: 900 }} dy={10} />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC', radius: 12 }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(v: number) => [formatCurrency(v), 'Sueldo Bruto']}
                    />
                    <Bar dataKey="Mensual" radius={[6, 6, 6, 6]} barSize={32}>
                      {chartData.map((d, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={d.name === '2026' ? '#10B981' : d.name === '2025' ? '#0F172A' : (parseInt(d.name) > 2026 ? '#EF4444' : '#E2E8F0')} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Garantía UGT</h4>
              <p className="text-sm font-medium leading-relaxed mb-6">
                "Hemos logrado que las subidas no solo se apliquen, sino que se paguen con carácter retroactivo desde el 1 de enero de cada ejercicio."
              </p>
              <div className="flex justify-between items-center text-[10px] border-b border-blue-500 pb-2">
                 <span>SUBIDA ACUMULADA 24-26</span>
                 <span className="font-black text-base">+{((data2026.monthlyTotal / baseline2024.monthlyTotal - 1) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center gap-6 flex flex-col items-center">
          <div className="flex items-center gap-2 text-slate-400 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
            <Info size={14} className="text-blue-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Cálculo de Retroactividad y Nóminas 2026</p>
          </div>
          <p className="text-[11px] text-slate-400 font-medium max-w-2xl leading-relaxed">
            Este simulador estima los atrasos basándose en la diferencia salarial de 2025 aplicada a 12 mensualidades y 2 pagas extra. 
            Referencia: BOE-A-2025-24445 del 3 de diciembre. 
            Las proyecciones de 2027 y 2028 son objetivos de negociación de UGT.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
