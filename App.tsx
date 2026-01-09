
import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Info, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Calendar,
  Wallet,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts';
import { BOE_DATA, COLORS } from './constants.tsx';
import { CalculationInputs, SalaryBreakdown } from './types.ts';

// Helper component for Cards
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

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

    // 2024 Baseline
    const baseline = {
      year: 2024,
      fixedIncrease: 0,
      variableIncrease: 0,
      totalPercentage: 0,
      annualTotal: baseAnnual2024,
      monthlyTotal: inputs.baseMonthlySalary2024,
      differenceAnnual: 0,
      differenceMonthly: 0
    };
    results.push(baseline);

    // 2025 Calculation
    const annual2025 = baseline.annualTotal * (1 + BOE_DATA.YEAR_2025.FIXED);
    results.push({
      year: 2025,
      fixedIncrease: BOE_DATA.YEAR_2025.FIXED,
      variableIncrease: 0,
      totalPercentage: BOE_DATA.YEAR_2025.FIXED * 100,
      annualTotal: annual2025,
      monthlyTotal: annual2025 / inputs.numPayments,
      differenceAnnual: annual2025 - baseline.annualTotal,
      differenceMonthly: (annual2025 / inputs.numPayments) - (baseline.monthlyTotal)
    });

    // 2026 Calculation
    const varInc = inputs.includeVariable2026 ? BOE_DATA.YEAR_2026.VARIABLE : 0;
    const totalInc2026 = BOE_DATA.YEAR_2026.FIXED + varInc;
    const annual2026 = annual2025 * (1 + totalInc2026);
    
    results.push({
      year: 2026,
      fixedIncrease: BOE_DATA.YEAR_2026.FIXED,
      variableIncrease: varInc,
      totalPercentage: totalInc2026 * 100,
      annualTotal: annual2026,
      monthlyTotal: annual2026 / inputs.numPayments,
      differenceAnnual: annual2026 - annual2025,
      differenceMonthly: (annual2026 / inputs.numPayments) - (annual2025 / inputs.numPayments)
    });

    return results;
  }, [inputs]);

  const chartData = calculations.map(c => ({
    name: `${c.year}`,
    Anual: parseFloat(c.annualTotal.toFixed(2)),
    Mensual: parseFloat(c.monthlyTotal.toFixed(2))
  }));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-2.5 rounded-xl shadow-lg shadow-red-200">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Simulador Salarial <span className="text-red-600">UGT</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Sector Público • Acuerdo 2025-2026
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['both', 'monthly', 'annual'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  viewMode === mode 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode === 'both' ? 'Vista Total' : mode === 'monthly' ? 'Mensual' : 'Anual'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs & BOE Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 border-t-4 border-t-red-600">
            <h2 className="text-xs font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-red-600" />
              Configuración Inicial
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Salario Bruto Mensual (2024)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">€</span>
                  <input 
                    type="number" 
                    value={inputs.baseMonthlySalary2024}
                    onChange={(e) => setInputs(prev => ({ ...prev, baseMonthlySalary2024: Number(e.target.value) }))}
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none font-black text-2xl text-slate-800"
                  />
                </div>
                <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Base Anual 2024:</span>
                  <span className="text-sm font-black text-slate-900">{formatCurrency(inputs.baseMonthlySalary2024 * inputs.numPayments)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Número de Pagas
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[12, 14].map(num => (
                    <button
                      key={num}
                      onClick={() => setInputs(prev => ({ ...prev, numPayments: num as 12 | 14 }))}
                      className={`py-3.5 rounded-xl border-2 font-black transition-all ${
                        inputs.numPayments === num 
                        ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' 
                        : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      {num} Pagas
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer group p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 transition-colors hover:bg-blue-50">
                  <div className="relative flex items-center pt-0.5">
                    <input 
                      type="checkbox" 
                      checked={inputs.includeVariable2026}
                      onChange={(e) => setInputs(prev => ({ ...prev, includeVariable2026: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <span className="block font-black text-slate-800 group-hover:text-blue-700 transition-colors">
                      Previsión IPC 2026 (+0,5%)
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed font-medium">
                      Variable por inflación. Si se activa, se suma al 1,5% fijo.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 text-white p-6 border-none shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldCheck size={140} />
            </div>
            <h2 className="text-xs font-black mb-4 flex items-center gap-2 uppercase tracking-widest text-emerald-400">
              <ShieldCheck size={16} />
              Garantía de Consolidación
            </h2>
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed relative z-10">
              <p className="font-medium text-slate-400 text-xs">
                El acuerdo de <strong className="text-white">UGT</strong> asegura que cada euro de subida es permanente:
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="bg-emerald-500/20 p-1.5 rounded-lg h-fit border border-emerald-500/20"><CheckCircle2 size={14} className="text-emerald-400" /></div>
                  <span className="text-xs"><strong>Irreversible:</strong> No son pagos únicos, se quedan en tu nómina para siempre.</span>
                </li>
                <li className="flex gap-3">
                  <div className="bg-emerald-500/20 p-1.5 rounded-lg h-fit border border-emerald-500/20"><CheckCircle2 size={14} className="text-emerald-400" /></div>
                  <span className="text-xs"><strong>Acumulativo:</strong> La subida de 2026 se aplica sobre el sueldo ya subido de 2025.</span>
                </li>
              </ul>
              <div className="pt-4 mt-4 border-t border-slate-800">
                <a 
                  href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-24445" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-red-400 font-black hover:text-red-300 transition-colors text-xs uppercase tracking-tighter"
                >
                  Consulta el BOE Oficial <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Results & Charts */}
        <div className="lg:col-span-8 space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 flex items-center gap-5 border-l-8 border-l-red-600 shadow-md">
              <div className="bg-red-50 p-4 rounded-2xl text-red-600">
                <Wallet size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Cómputo Anual 2026</p>
                <p className="text-3xl font-black text-slate-900 leading-none mb-2">
                  {formatCurrency(calculations[2].annualTotal)}
                </p>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg w-fit">
                   <ShieldCheck size={12} className="text-emerald-600" />
                   <span className="text-xs text-emerald-700 font-black">+{formatCurrency(calculations[2].annualTotal - calculations[0].annualTotal)} ganado</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 flex items-center gap-5 border-l-8 border-l-blue-600 shadow-md">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                <Calendar size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Nómina Mensual Final</p>
                <p className="text-3xl font-black text-slate-900 leading-none mb-2">
                  {formatCurrency(calculations[2].monthlyTotal)}
                </p>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg w-fit">
                   <ArrowUpRight size={12} className="text-blue-600" />
                   <span className="text-xs text-blue-700 font-black">+{formatCurrency(calculations[2].monthlyTotal - calculations[0].monthlyTotal)} / mes</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={14} /> Evolución del Acuerdo
              </h2>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-tighter flex items-center gap-1">
                <ShieldCheck size={10} /> Todo el importe es consolidable
              </span>
            </div>

            {calculations.map((yearData, idx) => (
              <Card key={yearData.year} className={`p-8 transition-all relative group ${idx === 0 ? 'bg-slate-50/50' : 'hover:shadow-xl hover:border-slate-200 border-2 border-transparent'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-3xl font-black text-slate-900 leading-none">{yearData.year}</h3>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${idx === 0 ? 'bg-slate-200 text-slate-600' : 'bg-red-600 text-white shadow-lg shadow-red-100'}`}>
                        {idx === 0 ? 'Situación Base' : `Subida +${yearData.totalPercentage.toFixed(1)}%`}
                      </span>
                      {idx > 0 && (
                        <div className="flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg shadow-emerald-100">
                          <ShieldCheck size={10} /> Consolidado
                        </div>
                      )}
                    </div>
                    {idx > 0 && (
                      <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        Acuerdo UGT aplicado sobre el año anterior.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-10 md:gap-16">
                    {(viewMode === 'both' || viewMode === 'annual') && (
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Sueldo Bruto Anual</p>
                        <p className={`text-2xl font-black ${idx === 0 ? 'text-slate-400' : 'text-slate-900'}`}>{formatCurrency(yearData.annualTotal)}</p>
                        {idx > 0 && (
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <ArrowUpRight size={12} className="text-emerald-600" />
                            <p className="text-xs text-emerald-600 font-black">+{formatCurrency(yearData.differenceAnnual)}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {(viewMode === 'both' || viewMode === 'monthly') && (
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Bruto Mensual</p>
                        <p className={`text-2xl font-black ${idx === 0 ? 'text-slate-400' : 'text-slate-900'}`}>{formatCurrency(yearData.monthlyTotal)}</p>
                        {idx > 0 && (
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <ArrowUpRight size={12} className="text-emerald-600" />
                            <p className="text-xs text-emerald-600 font-black">+{formatCurrency(yearData.differenceMonthly)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Visualization */}
          <Card className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <h2 className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase tracking-[0.2em]">
                <BarChart3 size={16} className="text-red-600" />
                Gráfica de Acumulación
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase">
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div> 2024</div>
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-600"></div> Acuerdo Pactado</div>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 900 }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  <Bar 
                    dataKey={viewMode === 'monthly' ? 'Mensual' : 'Anual'} 
                    name={viewMode === 'monthly' ? 'Mensual (Bruto)' : 'Anual (Bruto)'}
                    radius={[12, 12, 0, 0]} 
                    barSize={64}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#e2e8f0' : index === 1 ? '#f87171' : COLORS.PRIMARY} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <footer className="text-center py-8 border-t border-slate-100 mt-10 space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-tighter">
                <ShieldCheck size={18} className="text-emerald-500" /> Subidas Consolidables
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-tighter">
                <CheckCircle2 size={18} className="text-red-600" /> Garantía Sindical UGT
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 max-w-2xl mx-auto">
               <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic">
                * Esta herramienta es un simulador informativo. Los importes mostrados son brutos y no tienen en cuenta retenciones de IRPF ni cuotas a la Seguridad Social o clases pasivas, las cuales dependen de las circunstancias personales de cada trabajador/a.
               </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
