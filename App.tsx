
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
  Cell,
  Legend
} from 'recharts';
import { BOE_DATA, COLORS } from './constants.tsx';
import { CalculationInputs, SalaryBreakdown } from './types.ts';

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

    // Dynamic calculation for subsequent years
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
    <div className="min-h-screen pb-12 bg-slate-50/50">
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
                Sector Público • Horizonte 2025-2028
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
                      Incluir Cláusulas de Inflación
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed font-medium">
                      Suma un 0,5% adicional cada año según evolución del IPCA.
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
                El compromiso de <strong className="text-white">UGT</strong> es que cada subida pactada sea 100% consolidable:
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="bg-emerald-500/20 p-1.5 rounded-lg h-fit border border-emerald-500/20"><CheckCircle2 size={14} className="text-emerald-400" /></div>
                  <span className="text-xs"><strong>Efecto permanente:</strong> Los incrementos pasan a formar parte del sueldo base y trienios.</span>
                </li>
                <li className="flex gap-3">
                  <div className="bg-emerald-500/20 p-1.5 rounded-lg h-fit border border-emerald-500/20"><CheckCircle2 size={14} className="text-emerald-400" /></div>
                  <span className="text-xs"><strong>Cálculo Acumulativo:</strong> Cada porcentaje se aplica sobre el sueldo actualizado del año anterior.</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 flex items-center gap-5 border-l-8 border-l-red-600 shadow-md">
              <div className="bg-red-50 p-4 rounded-2xl text-red-600">
                <Wallet size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Bruto Anual en 2028</p>
                <p className="text-3xl font-black text-slate-900 leading-none mb-2">
                  {formatCurrency(finalData.annualTotal)}
                </p>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg w-fit">
                   <ShieldCheck size={12} className="text-emerald-600" />
                   <span className="text-xs text-emerald-700 font-black">+{formatCurrency(finalData.annualTotal - baselineData.annualTotal)} total ganado</span>
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
                  {formatCurrency(finalData.monthlyTotal)}
                </p>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg w-fit">
                   <ArrowUpRight size={12} className="text-blue-600" />
                   <span className="text-xs text-blue-700 font-black">+{formatCurrency(finalData.monthlyTotal - baselineData.monthlyTotal)} más al mes</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={14} /> Detalle por Ejercicio
              </h2>
            </div>

            <div className="space-y-4">
              {calculations.map((yearData, idx) => {
                const yearInfo = BOE_DATA.YEARS.find(y => y.year === yearData.year);
                return (
                  <Card key={yearData.year} className={`p-6 transition-all ${idx === 0 ? 'bg-slate-100/50' : 'hover:border-slate-300'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-black text-slate-900">{yearData.year}</h3>
                          {idx > 0 && (
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-white shadow-sm ${yearInfo?.isConfirmed ? 'bg-red-600' : 'bg-slate-500'}`}>
                              {yearInfo?.isConfirmed ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                              {yearInfo?.isConfirmed ? 'Acuerdo Firmado' : 'Previsión UGT'}
                            </div>
                          )}
                        </div>
                        {idx > 0 && <p className="text-xs font-bold text-slate-500">{yearInfo?.description}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-8 md:gap-12">
                        {(viewMode === 'both' || viewMode === 'annual') && (
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bruto Anual</p>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(yearData.annualTotal)}</p>
                            {idx > 0 && <p className="text-[10px] text-emerald-600 font-black">+{formatCurrency(yearData.differenceAnnual)}</p>}
                          </div>
                        )}
                        {(viewMode === 'both' || viewMode === 'monthly') && (
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mensual</p>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(yearData.monthlyTotal)}</p>
                            {idx > 0 && <p className="text-[10px] text-emerald-600 font-black">+{formatCurrency(yearData.differenceMonthly)}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="p-8">
            <h2 className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase tracking-[0.2em] mb-10">
              <BarChart3 size={16} className="text-red-600" />
              Progresión 2024-2028
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Bar 
                    dataKey={viewMode === 'monthly' ? 'Mensual' : 'Anual'} 
                    radius={[8, 8, 0, 0]} 
                    barSize={50}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#e2e8f0' : entry.isConfirmed ? COLORS.PRIMARY : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default App;
