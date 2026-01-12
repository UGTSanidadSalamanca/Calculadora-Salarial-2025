
import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  CheckCircle2, 
  BarChart3,
  Calendar,
  Wallet,
  Coins,
  ArrowRight,
  Info,
  History,
  Zap,
  ShieldCheck,
  TrendingDown,
  ChevronDown,
  Clock
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
    baseMonthlySalary2025: 2000,
    numPayments: 14,
    includeVariable2026: true
  });

  // Estado para alternar entre ver la nómina con atrasos o la consolidada
  const [showArrearsMode, setShowArrearsMode] = useState(true);

  const calculations = useMemo(() => {
    const results: SalaryBreakdown[] = [];
    const annual2025 = inputs.baseMonthlySalary2025 * inputs.numPayments;
    const factor2025 = 1 + (BOE_DATA.YEARS[0].fixed + BOE_DATA.YEARS[0].variable);
    const annual2024 = annual2025 / factor2025;

    // 2024 (Referencia)
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

    // 2025 (Base de cálculo)
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

    // 2026+ (Proyección)
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
        totalPercentage: ((currentAnnual / (annual2024)) - 1) * 100,
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
  
  // Atrasos: El trabajador percibirá de una vez la subida del 2,5% de todo 2025
  const bolsaAtrasos = data2025.differenceMonthly * inputs.numPayments;
  const nominaConAtrasos = data2026.monthlyTotal + bolsaAtrasos;
  const incrementoAcumuladoReal = ((data2026.monthlyTotal / baseline2024.monthlyTotal) - 1) * 100;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-red-100 pb-20">
      {/* HEADER COMPACTO */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg">
              <Calculator size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
              Simulador <span className="text-red-600">UGT</span> 2026
            </span>
          </div>
          <img src="https://www.ugt.es/sites/default/files/logo_policromo_header_ugt.png" alt="UGT" className="h-7" />
        </div>
      </header>

      {/* INPUT PRINCIPAL Y SELECTOR DE FASE */}
      <section className="bg-slate-900 pt-8 pb-32 px-4 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Calculadora Multiphase 2026</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-white text-sm font-bold uppercase tracking-[0.2em] opacity-60">Tu sueldo bruto mensual (Base 2025)</h2>
            <div className="relative inline-block group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-4xl group-focus-within:text-red-500">€</span>
              <input 
                type="number" 
                value={inputs.baseMonthlySalary2025}
                onChange={(e) => setInputs(prev => ({ ...prev, baseMonthlySalary2025: Number(e.target.value) }))}
                className="bg-transparent border-b-4 border-white/10 text-white text-6xl md:text-8xl font-black text-center w-full max-w-md outline-none focus:border-red-600 transition-all pb-2 px-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* SELECTOR DE FASE: EL CAMBIO CLAVE */}
          <div className="flex flex-col items-center gap-4">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">¿Qué nómina quieres consultar?</p>
             <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                <button 
                  onClick={() => setShowArrearsMode(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all ${showArrearsMode ? 'bg-amber-500 text-white shadow-xl scale-105' : 'text-slate-400'}`}
                >
                  <Zap size={14} fill={showArrearsMode ? "currentColor" : "none"} />
                  CON ATRASOS 2025
                </button>
                <button 
                  onClick={() => setShowArrearsMode(false)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all ${!showArrearsMode ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'text-slate-400'}`}
                >
                  <CheckCircle2 size={14} />
                  MES ORDINARIO
                </button>
             </div>
             <p className="text-[10px] font-bold text-slate-500 italic max-w-xs leading-relaxed">
               {showArrearsMode 
                ? "Muestra el ingreso único de Enero/Febrero con toda la retroactividad acumulada." 
                : "Muestra tu nuevo sueldo base consolidado para el resto del año 2026."}
             </p>
          </div>
        </div>
      </section>

      {/* DASHBOARD ADAPTATIVO */}
      <main className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TARJETA PRINCIPAL: CAMBIA SEGÚN EL MODO */}
          <div className={`col-span-1 md:col-span-2 rounded-[2.5rem] p-10 shadow-2xl transition-all duration-700 border-t-8 ${
            showArrearsMode 
              ? 'bg-white border-amber-500 shadow-amber-200/20' 
              : 'bg-white border-emerald-600 shadow-emerald-200/20'
          }`}>
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${showArrearsMode ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {showArrearsMode ? 'Ingreso Bruto Estimado' : 'Nuevo Sueldo Consolidado'}
                </p>
                <h3 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter">
                  {formatCurrency(showArrearsMode ? nominaConAtrasos : data2026.monthlyTotal)}
                </h3>
              </div>
              <div className={`p-4 rounded-3xl ${showArrearsMode ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                {showArrearsMode ? <Zap size={32} /> : <CheckCircle2 size={32} />}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10 pt-10 border-t border-slate-100">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mejora Mensual Fija</p>
                <p className="text-3xl font-black text-slate-800">+{formatCurrency(data2026.differenceMonthly)}</p>
                <p className="text-[10px] font-bold text-slate-400">Respecto a tu sueldo de 2025</p>
              </div>
              {showArrearsMode ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Bolsa de Atrasos</p>
                  <p className="text-3xl font-black text-amber-500">+{formatCurrency(bolsaAtrasos)}</p>
                  <p className="text-[10px] font-bold text-amber-400 italic">Pago único por retroactividad 2025</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ganancia Extra Anual</p>
                  <p className="text-3xl font-black text-emerald-600">+{formatCurrency(data2026.annualTotal - data2025.annualTotal)}</p>
                  <p className="text-[10px] font-bold text-emerald-400 italic">Este año ganarás más que el pasado</p>
                </div>
              )}
            </div>
          </div>

          {/* TARJETA LATERAL: RECUPERACIÓN REAL */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/10 border-b-8 border-red-600 flex flex-col justify-between group">
            <div className="space-y-6">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                 <TrendingUp size={14} /> Recuperación Real
              </p>
              <div className="space-y-1">
                <h3 className="text-6xl font-black text-white tracking-tighter">+{incrementoAcumuladoReal.toFixed(1)}%</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Acuerdo 2024-2026</p>
              </div>
            </div>
            
            <div className="mt-10 space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Poder adquisitivo vs 2024</p>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${incrementoAcumuladoReal * 5}%` }}></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                Gracias al acuerdo marco, tu salario base ha subido de forma consolidada para siempre.
              </p>
            </div>
          </div>
        </div>

        {/* CRONOLOGÍA DETALLADA */}
        <div className="mt-20 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
              <Clock size={14} /> Evolución del acuerdo
            </h4>
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
               {[12, 14].map(n => (
                 <button key={n} onClick={() => setInputs(p => ({...p, numPayments: n as 12|14}))}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${inputs.numPayments === n ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                   {n} PAGAS
                 </button>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {calculations.map((year, idx) => {
              const is2024 = year.year === 2024;
              const is2026 = year.year === 2026;
              const is2025 = year.year === 2025;
              
              return (
                <div key={year.year} className={`relative flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2.5rem] border transition-all duration-500 ${
                  is2026 ? 'bg-white border-emerald-100 shadow-xl shadow-emerald-500/5 scale-[1.01] z-10' : 
                  is2024 ? 'bg-slate-100/50 border-slate-100 opacity-60 grayscale' : 'bg-white border-slate-200'
                }`}>
                  {/* Año Bubble */}
                  <div className={`w-36 py-6 rounded-[2rem] flex flex-col items-center shrink-0 shadow-inner ${
                    is2026 ? 'bg-emerald-600 text-white' : 
                    is2024 ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white'
                  }`}>
                    <span className="text-3xl font-black tracking-tighter leading-none">{year.year}</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] mt-2 opacity-70 whitespace-nowrap">
                      {is2026 ? 'OBJETIVO' : is2024 ? 'REFERENCIA' : 'CONSOLIDADO'}
                    </span>
                  </div>

                  {/* Datos en Grilla */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacto Año</p>
                      <p className={`text-xl font-black ${is2024 ? 'text-slate-400' : 'text-slate-900'}`}>
                        {is2024 ? '0%' : is2025 ? '2.5%' : `${(year.fixedIncrease + (year.year === 2026 && inputs.includeVariable2026 ? year.variableIncrease : 0)) * 100}%`}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 italic">{is2024 ? 'Pre-Acuerdo' : is2025 ? 'Fijo+Variable' : 'Pactado'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nómina Mensual</p>
                      <p className="text-xl font-black text-slate-800">{formatCurrency(year.monthlyTotal)}</p>
                      <p className="text-[10px] font-medium text-slate-400 italic">Sueldo Bruto</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ingreso Anual</p>
                      <p className="text-xl font-black text-slate-800">{formatCurrency(year.annualTotal)}</p>
                      <p className="text-[10px] font-medium text-slate-400 italic">Suma total año</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mejora Neta</p>
                      <p className={`text-xl font-black ${is2024 ? 'text-slate-300' : 'text-blue-600'}`}>
                        {is2024 ? '---' : `+${formatCurrency(year.monthlyTotal - baseline2024.monthlyTotal)}`}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 italic">Mensual vs 2024</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center gap-12 opacity-30 grayscale items-center">
            <img src="https://www.ugt.es/sites/default/files/logo_policromo_header_ugt.png" alt="UGT" className="h-8" />
            <div className="h-8 w-px bg-slate-400"></div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-900">Servicios Públicos</span>
          </div>
          <div className="space-y-4">
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
              Esta herramienta es un simulador informativo desarrollado por UGT. Los cálculos se basan en el sueldo bruto. 
              Recuerda que tu nómina final dependerá de tu situación personal (IRPF, antigüedad, trienios, etc). 
              Consolidamos tus derechos para el futuro.
            </p>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
              UGT: Tu fuerza, nuestro compromiso.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
