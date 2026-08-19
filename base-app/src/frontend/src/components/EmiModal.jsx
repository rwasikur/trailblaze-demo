import React, { useState, useMemo } from 'react';

const EmiModal = ({ car, isOpen, onClose, onProceedToBook }) => {
    const [downPaymentPct, setDownPaymentPct] = useState(20);
    const [downPaymentInput, setDownPaymentInput] = useState('20');

    const [annualRate, setAnnualRate] = useState(9.5);
    const [annualRateInput, setAnnualRateInput] = useState('9.5');

    const [tenure, setTenure] = useState(36);
    const [tenureInput, setTenureInput] = useState('36');

    const price = car?.price || 0;

    const results = useMemo(() => {
        const downPayment = Math.round((downPaymentPct / 100) * price);
        const principal = price - downPayment;
        const r = annualRate / 12 / 100;
        const n = tenure;

        let emi = 0;
        if (n > 0 && principal > 0) {
            emi = r === 0
                ? Math.round(principal / n)
                : Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
        }

        const totalPayment = downPayment + emi * n;
        const totalInterest = totalPayment - price;

        return { downPayment, principal, emi, totalPayment, totalInterest };
    }, [price, downPaymentPct, annualRate, tenure]);

    if (!isOpen) return null;

    const fmt = (v) => '$' + Math.abs(Math.round(v)).toLocaleString('en-US');

    const tenureLabel = (n) => {
        if (!n || n <= 0) return '';
        if (n % 12 === 0) return `${n / 12} yr${n !== 12 ? 's' : ''}`;
        return `${(n / 12).toFixed(1)} yrs`;
    };

    // ── Input handlers ──

    const handleDownPaymentInput = (val) => {
        setDownPaymentInput(val);
        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0 && num <= 100) setDownPaymentPct(num);
    };
    const handleDownPaymentSlider = (val) => {
        const num = Number(val);
        setDownPaymentPct(num);
        setDownPaymentInput(String(num));
    };

    const handleRateInput = (val) => {
        setAnnualRateInput(val);
        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0 && num <= 100) setAnnualRate(num);
    };
    const handleRateSlider = (val) => {
        const num = Number(val);
        setAnnualRate(num);
        setAnnualRateInput(String(num));
    };

    const handleTenureInput = (val) => {
        setTenureInput(val);
        const num = parseInt(val, 10);
        if (!isNaN(num) && num > 0 && num <= 360) setTenure(num);
    };
    const handleTenureSlider = (val) => {
        const num = Number(val);
        setTenure(num);
        setTenureInput(String(num));
    };

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
                            {car?.brand} {car?.name}&nbsp;·&nbsp;Ex-showroom ${price.toLocaleString('en-US')}
                        </p>
                    </div>

                    {/* ── Down Payment ── */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Down Payment</span>
                            <span className="text-blue-400 text-sm font-black">{fmt(results.downPayment)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="range" min={0} max={100} step={0.1}
                                value={Math.min(downPaymentPct, 100)}
                                onChange={(e) => handleDownPaymentSlider(e.target.value)}
                                className="flex-1 accent-blue-500 h-1.5 rounded-full cursor-pointer"
                            />
                            <div className="relative flex-shrink-0">
                                <input
                                    type="number" min={0} max={100} step={0.1}
                                    value={downPaymentInput}
                                    onChange={(e) => handleDownPaymentInput(e.target.value)}
                                    className="w-20 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-black text-center focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all pr-5 py-1"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">%</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-1">
                            <span>0%</span><span>100%</span>
                        </div>
                    </div>

                    {/* ── Interest Rate ── */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interest Rate</span>
                            <span className="text-slate-400 text-[10px] font-medium">per annum</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="range" min={0} max={30} step={0.1}
                                value={Math.min(annualRate, 30)}
                                onChange={(e) => handleRateSlider(e.target.value)}
                                className="flex-1 accent-blue-500 h-1.5 rounded-full cursor-pointer"
                            />
                            <div className="relative flex-shrink-0">
                                <input
                                    type="number" min={0} max={100} step={0.1}
                                    value={annualRateInput}
                                    onChange={(e) => handleRateInput(e.target.value)}
                                    className="w-20 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-black text-center focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all pr-5 py-1"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">%</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-1">
                            <span>0%</span><span>30%+</span>
                        </div>
                    </div>

                    {/* ── Loan Tenure ── */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loan Tenure</span>
                            {tenure > 0 && (
                                <span className="text-slate-400 text-[10px] font-medium">{tenureLabel(tenure)}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="range" min={1} max={360} step={1}
                                value={Math.min(Math.max(tenure, 1), 360)}
                                onChange={(e) => handleTenureSlider(e.target.value)}
                                className="flex-1 accent-blue-500 h-1.5 rounded-full cursor-pointer"
                            />
                            <div className="relative flex-shrink-0">
                                <input
                                    type="number" min={1} max={360} step={1}
                                    value={tenureInput}
                                    onChange={(e) => handleTenureInput(e.target.value)}
                                    className="w-24 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-black text-center focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all pr-7 py-1"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[9px] font-bold pointer-events-none">mo</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-1">
                            <span>1 mo</span><span>360 mo (30 yrs)</span>
                        </div>
                    </div>

                    {/* ── Summary strip ── */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-medium pt-1 border-t border-white/10">
                        <span>Loan: <span className="text-slate-300 font-bold">{fmt(results.principal)}</span></span>
                        <span>Rate: <span className="text-slate-300 font-bold">{annualRate}% p.a.</span></span>
                        <span>Down: <span className="text-slate-300 font-bold">{downPaymentPct}% · {fmt(results.downPayment)}</span></span>
                        <span>Term: <span className="text-slate-300 font-bold">{tenure} mo{tenure > 0 ? ` · ${tenureLabel(tenure)}` : ''}</span></span>
                    </div>
                </div>

                {/* ── Result Card ── */}
                <div className="p-6 space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your EMI Breakdown</div>

                    <div className="rounded-2xl border-2 border-blue-600 bg-blue-50 shadow-md shadow-blue-100 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-black text-slate-900">
                                    {tenure} Months
                                    {tenure > 0 && (
                                        <span className="text-slate-400 font-medium ml-1">({tenureLabel(tenure)})</span>
                                    )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                    @ <span className="text-slate-600 font-bold">{annualRate}%</span> p.a. · <span className="text-slate-600 font-bold">{downPaymentPct}%</span> down
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-blue-600">{fmt(results.emi)}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/month</div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-blue-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Down Payment</div>
                                <div className="text-xs font-black text-slate-700 mt-0.5">{fmt(results.downPayment)}</div>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Loan Amount</div>
                                <div className="text-xs font-black text-slate-700 mt-0.5">{fmt(results.principal)}</div>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Interest</div>
                                <div className="text-xs font-black text-red-500 mt-0.5">{fmt(results.totalInterest)}</div>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Cost</div>
                                <div className="text-xs font-black text-slate-700 mt-0.5">{fmt(results.totalPayment)}</div>
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium">
                        * EMI is indicative. Final rate subject to lender approval.
                    </p>

                    <button
                        onClick={() => {
                            onClose();
                            onProceedToBook({
                                emi: results.emi,
                                tenure,
                                downPaymentPct,
                                annualRate,
                            });
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