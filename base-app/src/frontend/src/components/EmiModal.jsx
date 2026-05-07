import React, { useState, useMemo } from 'react';

const TENURE_OPTIONS = [12, 24, 36, 48, 60, 72, 84];

const EmiModal = ({ car, isOpen, onClose, onProceedToBook }) => {
    const [downPaymentPct, setDownPaymentPct] = useState(20);
    const [annualRate, setAnnualRate] = useState(9.5);
    const [selectedTenure, setSelectedTenure] = useState(36);

    const results = useMemo(() => {
        const price = car?.price || 0;
        const downPayment = Math.round((downPaymentPct / 100) * price);
        const principal = price - downPayment;
        const r = annualRate / 12 / 100;

        const calcEMI = (n) => {
            if (r === 0 || principal === 0) return Math.round(principal / n);
            return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
        };

        const tenures = TENURE_OPTIONS.map((n) => {
            const emi = calcEMI(n);
            const totalPayment = downPayment + emi * n;
            const totalInterest = totalPayment - price;
            return { n, emi, totalPayment, totalInterest, downPayment };
        });

        return { tenures, principal, downPayment };
    }, [car?.price, downPaymentPct, annualRate]);

    if (!isOpen) return null;

    const fmt = (v) => '$' + Math.abs(Math.round(v)).toLocaleString('en-US');
    const selected = results.tenures.find((t) => t.n === selectedTenure);

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300 cursor-pointer overflow-y-auto"
        >
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl my-auto shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 cursor-default overflow-hidden">

                {/* ── Header / Controls ── */}
                <div className="bg-slate-950 px-8 pt-8 pb-7 relative space-y-5">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all flex items-center justify-center"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Financial Tool</div>
                        <h2 className="text-2xl font-black text-white tracking-tight">EMI Calculator</h2>
                        <p className="text-slate-400 text-xs font-medium mt-1">
                            {car?.brand} {car?.name}&nbsp;·&nbsp;Ex-showroom ${car?.price?.toLocaleString('en-US')}
                        </p>
                    </div>

                    {/* Down Payment Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Down Payment</span>
                            <span className="text-sm font-black text-white">
                                {downPaymentPct}%&nbsp;
                                <span className="text-blue-400">{fmt(results.downPayment)}</span>
                            </span>
                        </div>
                        <input
                            type="range" min={10} max={50} step={5}
                            value={downPaymentPct}
                            onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                            className="w-full accent-blue-500 h-1.5 rounded-full cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-1">
                            <span>10%</span><span>50%</span>
                        </div>
                    </div>

                    {/* Interest Rate Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interest Rate</span>
                            <span className="text-sm font-black text-white">
                                <span className="text-blue-400">{annualRate.toFixed(1)}%</span>&nbsp;p.a.
                            </span>
                        </div>
                        <input
                            type="range" min={5} max={20} step={0.5}
                            value={annualRate}
                            onChange={(e) => setAnnualRate(Number(e.target.value))}
                            className="w-full accent-blue-500 h-1.5 rounded-full cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-1">
                            <span>5%</span><span>20%</span>
                        </div>
                    </div>

                    {/* Summary pill */}
                    <div className="flex gap-4 text-[10px] text-slate-500 font-medium pt-1 border-t border-white/10">
                        <span>Loan: <span className="text-slate-300 font-bold">{fmt(results.principal)}</span></span>
                        <span>Rate: <span className="text-slate-300 font-bold">{annualRate.toFixed(1)}% p.a.</span></span>
                        <span>Down: <span className="text-slate-300 font-bold">{downPaymentPct}%</span></span>
                    </div>
                </div>

                {/* ── Tenure Cards ── */}
                <div className="p-6 space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Choose Tenure</div>

                    {results.tenures.map(({ n, emi, totalPayment, totalInterest }) => (
                        <button
                            key={n}
                            onClick={() => setSelectedTenure(n)}
                            className={`w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${selectedTenure === n
                                    ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
                                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedTenure === n ? 'border-blue-600' : 'border-slate-300'}`}>
                                        {selectedTenure === n && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-slate-900">
                                            {n} Months&nbsp;
                                            <span className="text-slate-400 font-medium">
                                                ({n % 12 === 0 ? `${n / 12} yr${n !== 12 ? 's' : ''}` : `${(n / 12).toFixed(1)} yrs`})
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            Total Interest: <span className="text-red-500 font-bold">{fmt(totalInterest)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-blue-600">{fmt(emi)}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/month</div>
                                </div>
                            </div>

                            {selectedTenure === n && (
                                <div className="mt-3 pt-3 border-t border-blue-100 grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Down Payment</div>
                                        <div className="text-xs font-black text-slate-700 mt-0.5">{fmt(results.downPayment)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Interest</div>
                                        <div className="text-xs font-black text-red-500 mt-0.5">{fmt(totalInterest)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Cost</div>
                                        <div className="text-xs font-black text-slate-700 mt-0.5">{fmt(totalPayment)}</div>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}

                    <p className="text-[10px] text-slate-400 font-medium pt-1">
                        * EMI is indicative. Final rate subject to lender approval.
                    </p>

                    <button
                        onClick={() => {
                            onClose();
                            onProceedToBook(selected
                                ? { emi: selected.emi, tenure: selected.n, downPaymentPct, annualRate }
                                : null
                            );
                        }}
                        className="w-full mt-1 py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
                    >
                        Proceed to Book →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmiModal;