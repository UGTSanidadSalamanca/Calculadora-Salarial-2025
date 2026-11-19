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
  Clock,
  Settings2
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
    referenceYear: 2025,
    numPayments: 14,
    includeVariable2026: true
  });

  // Año objetivo seleccionado para el simulador principal (2026, 2027 o 2028)
  const [selectedYear, setSelectedYear] = useState<2026 | 2027 | 2028>(2027);

  // Estado para alternar entre ver la nómina con atrasos/liquidación o la consolidada
  const [showArrearsMode, setShowArrearsMode] = useState(false);

  const calculations = useMemo(() => {
    const results: SalaryBreakdown[] = [];
    const factor2026 = 1 + BOE_DATA.YEARS[1].fixed + (inputs.includeVariable2026 ? BOE_DATA.YEARS[1].variable : 0);
    // Permitir una base de 2025 o una cuantía que ya incluya el incremento de 2026.
    const annual2025 = (inputs.baseMonthlySalary2025 * inputs.numPayments) / (inputs.referenceYear === 2026 ? factor2026 : 1);
    // El incremento del 2,5 % de 2025 es consolidable, sin componente IPC propio de 2025.
    const factor2025 = 1 + (BOE_DATA.YEARS[0].fixed + BOE_DATA.YEARS[0].variable);
    const annual2024 = annual2025 / factor2025;

    // 2024 (Referencia inicial)
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

    // 2025 (Base de cálculo - Sueldo que el usuario percibe en 2025)
    results.push({
      year: 2025,
      fixedIncrease: BOE_DATA.YEARS[0].fixed,
      variableIncrease: BOE_DATA.YEARS[0].variable,
      totalPercentage: (factor2025 - 1) * 100,
      annualTotal: annual2025,
      monthlyTotal: annual2025 / inputs.numPayments,
      differenceAnnual: annual2025 - annual2024,
      differenceMonthly: (annual2025 - annual2024) / inputs.numPayments
    });

    // 2026 - 2028 (Senda plurianual del Acuerdo Marco)
    let currentAnnual = annual2025;
    BOE_DATA.YEARS.slice(1).forEach((yearInfo) => {
      // Cláusula de garantía IPC del acuerdo (0,5% vinculado a la inflación de 2026)
      const varInc = (yearInfo.year === 2026 && !inputs.includeVariable2026) ? 0 : yearInfo.variable;
      // En 2027 la subida fija es del 4,5% (el 0,5% de 2026 ya consolida en tablas o liquida atrasos)
      const totalInc = yearInfo.year === 2027 ? yearInfo.fixed : yearInfo.fixed + varInc;
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

  const baseline2024 = calculations.find(d => d.year === 2024)!;
  const data2025 = calculations.find(d => d.year === 2025)!;
  const data2026 = calculations.find(d => d.year === 2026)!;
  const data2027 = calculations.find(d => d.year === 2027)!;
  const data2028 = calculations.find(d => d.year === 2028)!;

  const activeData = calculations.find(d => d.year === selectedYear) || data2027;

  // Estimación opcional de un supuesto de retroactividad, separada del sueldo ordinario:
  // - 2026: Atrasos de 2025 aplicados a 12 mensualidades y 2 pagas extra
  // - 2027: Abono retroactivo del 0,5% de desviación del IPC de 2026 liquidado en el 1T de 2027
  // - 2028: Consolidación total acumulada
  const bolsaAtrasos = useMemo(() => {
    if (selectedYear === 2027 && inputs.includeVariable2026) {
      // Supuesto de liquidación completa del 0,5 % de 2026; no presupone que siga pendiente.
      return data2025.annualTotal * 0.005;
    }
    return 0;
  }, [selectedYear, data2025, inputs]);

  const nominaConAtrasos = activeData.monthlyTotal; // No sumar atrasos teóricos a una nómina ordinaria.
  const incrementoAcumuladoNominal = ((activeData.monthlyTotal / baseline2024.monthlyTotal) - 1) * 100;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

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
              Simulador <span className="text-red-600">UGT</span> 2025-2028
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
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Acuerdo Marco Función Pública 2025-2028
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-white text-sm font-bold uppercase tracking-[0.2em] opacity-60">Tu sueldo bruto mensual (base seleccionada)</h2>
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

          {/* SELECTORES DE CONFIGURACIÓN */}
          <div className="flex flex-col items-center gap-6">
             <div className="flex flex-wrap justify-center gap-4">
                {/* Año del salario introducido */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                  {([2025, 2026] as const).map(year => (
                    <button key={year} onClick={() => setInputs(p => ({...p, referenceYear: year}))}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black ${inputs.referenceYear === year ? 'bg-white text-slate-900' : 'text-slate-400'}`}>
                      BASE {year}
                    </button>
                  ))}
                </div>
                {/* Selector Año Objetivo */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                   {([2026, 2027, 2028] as const).map(year => (
                     <button 
                       key={year} 
                       onClick={() => setSelectedYear(year)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                         selectedYear === year ? 'bg-red-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-white'
                       }`}
                     >
                       OBJETIVO {year}
                     </button>
                   ))}
                </div>

                {/* Selector Pagas */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                   {[12, 14].map(n => (
                     <button key={n} onClick={() => setInputs(p => ({...p, numPayments: n as 12|14}))}
                       className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${inputs.numPayments === n ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>
                       {n} PAGAS
                     </button>
                   ))}
                </div>

                {/* Toggle IPC 2026 */}
                <button 
                  onClick={() => setInputs(p => ({...p, includeVariable2026: !p.includeVariable2026}))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all text-[10px] font-black ${
                    inputs.includeVariable2026 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20' 
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                  title="Cláusula condicionada al IPC 2026 >= 1,5 %, abonable en el primer trimestre de 2027"
                >
                  <Settings2 size={14} />
                  IPC 2026 +0,5% (CONDICIONAL)
                </button>
             </div>

             <div className="h-px w-20 bg-white/10"></div>

             {/* Selector Atrasos vs Ordinario */}
             <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                <button 
                  onClick={() => setShowArrearsMode(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all ${showArrearsMode ? 'bg-amber-500 text-white shadow-xl scale-105' : 'text-slate-400'}`}
                >
                  <Zap size={14} fill={showArrearsMode ? "currentColor" : "none"} />
                  {selectedYear === 2026 
                    ? 'ATRASOS 2025 NO ESTIMADOS' 
                    : selectedYear === 2027 
                      ? 'ESTIMAR IPC 2026' 
                      : 'CONSOLIDADO 2028'}
                </button>
                <button 
                  onClick={() => setShowArrearsMode(false)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all ${!showArrearsMode ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'text-slate-400'}`}
                >
                  <CheckCircle2 size={14} />
                  MES ORDINARIO
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD ADAPTATIVO */}
      <main className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TARJETA PRINCIPAL: CAMBIA SEGÚN EL AÑO Y MODO */}
          <div className={`col-span-1 md:col-span-2 rounded-[2.5rem] p-10 shadow-2xl transition-all duration-700 border-t-8 ${
            showArrearsMode && bolsaAtrasos > 0
              ? 'bg-white border-amber-500 shadow-amber-200/20' 
              : 'bg-white border-emerald-600 shadow-emerald-200/20'
          }`}>
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${showArrearsMode && bolsaAtrasos > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {showArrearsMode && bolsaAtrasos > 0 
                      ? `Sueldo bruto consolidado (${selectedYear})` 
                      : `Nuevo Sueldo Consolidado (${selectedYear})`}
                  </p>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                    {selectedYear === 2027 ? '+4,5% Subida RDL' : selectedYear === 2026 ? '+1,5% Fijo + IPC' : '+2,0% Cierre'}
                  </span>
                </div>
                <h3 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter">
                  {formatCurrency(activeData.monthlyTotal)}
                </h3>
              </div>
              <div className={`p-4 rounded-3xl ${showArrearsMode && bolsaAtrasos > 0 ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                {showArrearsMode && bolsaAtrasos > 0 ? <Zap size={32} /> : <CheckCircle2 size={32} />}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10 pt-10 border-t border-slate-100">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mejora Mensual Fija</p>
                <p className="text-3xl font-black text-slate-800">+{formatCurrency(activeData.monthlyTotal - data2025.monthlyTotal)}</p>
                <p className="text-[10px] font-bold text-slate-400">Respecto a tu sueldo base de 2025</p>
              </div>
              {showArrearsMode && bolsaAtrasos > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Bolsa de Atrasos</p>
                  <p className="text-3xl font-black text-amber-500">+{formatCurrency(bolsaAtrasos)}</p>
                  <p className="text-[10px] font-bold text-amber-400 italic">
                    {selectedYear === 2026 
                      ? 'Pago único por retroactividad 2025' 
                      : 'Estimación no garantizada del 0,5 % de 2026; su abono depende del IPC y de la Administración'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ganancia Extra Anual</p>
                  <p className="text-3xl font-black text-emerald-600">+{formatCurrency(activeData.annualTotal - data2025.annualTotal)}</p>
                  <p className="text-[10px] font-bold text-emerald-400 italic">Acumulado anual adicional respecto a 2025</p>
                </div>
              )}
            </div>
          </div>

          {/* TARJETA LATERAL: RECUPERACIÓN REAL */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/10 border-b-8 border-red-600 flex flex-col justify-between group">
            <div className="space-y-6">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                 <TrendingUp size={14} /> Incremento salarial nominal
              </p>
              <div className="space-y-1">
                <h3 className="text-6xl font-black text-white tracking-tighter">+{incrementoAcumuladoNominal.toFixed(1)}%</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Acuerdo 2024-{selectedYear}</p>
              </div>
            </div>
            
            <div className="mt-10 space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase mb-2">
                  <span>Incremento nominal vs 2024</span>
                  <span>{incrementoAcumuladoNominal.toFixed(1)}% / +11,4%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-red-600 transition-all duration-1000" 
                     style={{ width: `${Math.min(100, (incrementoAcumuladoNominal / 11.45) * 100)}%` }}
                   ></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                {selectedYear === 2027 
                  ? "Incluye la subida del 4,5 % sobre 2026; el 0,5 % de 2026 sigue condicionado al IPC." 
                  : selectedYear === 2028 
                    ? "Cierre previsto del Acuerdo Marco con incrementos acumulados y compuestos." 
                    : "Gracias al Acuerdo Marco, tu salario base se consolida permanentemente."}
              </p>
            </div>
          </div>
        </div>

        {/* CRONOLOGÍA DETALLADA */}
        <div className="mt-20 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
              <Clock size={14} /> Senda Salarial 2024-2028 (Haz clic para seleccionar)
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {calculations.map((year) => {
              const is2024 = year.year === 2024;
              const is2025 = year.year === 2025;
              const isSelected = year.year === selectedYear;
              
              return (
                <div 
                  key={year.year} 
                  onClick={() => !is2024 && !is2025 && setSelectedYear(year.year as 2026 | 2027 | 2028)}
                  className={`relative flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2.5rem] border transition-all duration-500 ${
                    !is2024 && !is2025 ? 'cursor-pointer hover:border-red-400' : ''
                  } ${
                    isSelected ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.01] ring-2 ring-emerald-500/20 z-10' : 
                    is2024 ? 'bg-slate-100/50 border-slate-100 opacity-60 grayscale' : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Año Bubble */}
                  <div className={`w-36 py-6 rounded-[2rem] flex flex-col items-center shrink-0 shadow-inner ${
                    isSelected ? 'bg-emerald-600 text-white' : 
                    is2024 ? 'bg-slate-200 text-slate-400' : 
                    is2025 ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    <span className="text-3xl font-black tracking-tighter leading-none">{year.year}</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] mt-2 opacity-70 whitespace-nowrap">
                      {isSelected ? 'SELECCIONADO' : is2024 ? 'REFERENCIA' : is2025 ? 'BASE ACTUAL' : 'PACTADO'}
                    </span>
                  </div>

                  {/* Datos en Grilla */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacto Año</p>
                      <p className={`text-xl font-black ${is2024 ? 'text-slate-400' : 'text-slate-900'}`}>
                        {is2024 
                          ? '0%' 
                          : is2025 
                            ? '2,5%' 
                            : year.year === 2026 
                              ? (inputs.includeVariable2026 ? '2,0%' : '1,5%') 
                              : year.year === 2027 
                                ? '4,5%' 
                                : '2,0%'}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 italic">
                        {is2024 
                          ? 'Pre-Acuerdo' 
                          : is2025 
                            ? 'Consolidable' 
                            : year.year === 2026 
                              ? (inputs.includeVariable2026 ? '1,5% Fijo + 0,5% IPC' : '1,5% Fijo') 
                              : year.year === 2027 
                                ? '4,5% sobre 2026 actualizado' 
                                : '2,0% Cierre Acuerdo'}
                      </p>
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
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mejora vs 2024</p>
                      <p className={`text-xl font-black ${is2024 ? 'text-slate-300' : 'text-blue-600'}`}>
                        {is2024 ? '---' : `+${formatCurrency(year.monthlyTotal - baseline2024.monthlyTotal)}`}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 italic">
                        {is2024 ? 'Base inicial' : `+${year.totalPercentage.toFixed(1)}% acumulado`}
                      </p>
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
            <span className="text-xs font-black uppercase tracking-widest text-slate-900">Servicios Públicos Salamanca</span>
          </div>
          <div className="space-y-4">
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
              Esta herramienta es un simulador informativo desarrollado por UGT Sanidad Salamanca. Los cálculos se basan en el
              sueldo bruto homogéneo; las pagas extra y los complementos variables pueden diferir. Recogen las subidas acordadas en el <strong>Acuerdo Marco 2025-2028</strong> y los Reales Decretos-leyes
              correspondientes (RDL 14/2025 y RDL 37/2026 con subida fija del 4,5% y compensación por IPC).
              Recuerda que tu nómina final dependerá de tu situación personal (IRPF, antigüedad, trienios, carrera profesional, etc.).
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
