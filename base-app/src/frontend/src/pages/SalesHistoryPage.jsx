import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const SalesHistoryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const lastAcceptedId = location.state?.lastAcceptedId;
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [conditionFilter, setConditionFilter] = useState('All');
    const [sortBy, setSortBy] = useState('date_desc');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
        } else {
            fetchSales(token);
        }
    }, [navigate]);

    const fetchSales = async (token) => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/sales/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSales(data || []);
        } catch (err) {
            console.error('Failed to fetch sales:', err);
            setSales([]);
            toast.error('Failed to fetch sales history');
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = useMemo(() => {
        let result = [...sales];

        // Search
        if (search) {
            const lowSearch = search.toLowerCase();
            result = result.filter(s =>
                s.buyer_name?.toLowerCase().includes(lowSearch) ||
                s.car?.name?.toLowerCase().includes(lowSearch) ||
                s.car?.brand?.toLowerCase().includes(lowSearch) ||
                s._id?.toLowerCase().includes(lowSearch)
            );
        }

        // Condition Filter
        if (conditionFilter !== 'All') {
            result = result.filter(s => s.car?.condition === conditionFilter);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'date_desc') return new Date(b.sale_date) - new Date(a.sale_date);
            if (sortBy === 'date_asc') return new Date(a.sale_date) - new Date(b.sale_date);
            if (sortBy === 'price_desc') return (b.sale_price || 0) - (a.sale_price || 0);
            if (sortBy === 'price_asc') return (a.sale_price || 0) - (b.sale_price || 0);
            return 0;
        });

        return result;
    }, [sales, search, conditionFilter, sortBy]);

    const handleExport = () => {
        if (filteredSales.length === 0) {
            toast.error('No data available to export');
            return;
        }

        toast.info('Generating CSV report...');

        // CSV Headers
        const headers = ['Ref ID', 'Buyer', 'Brand', 'Model', 'Condition', 'Date', 'Price'];

        // CSV Rows
        const rows = filteredSales.map(sale => [
            `#TRB-${sale._id.slice(-8).toUpperCase()}`,
            sale.buyer_name,
            sale.car?.brand || 'N/A',
            sale.car?.name || 'N/A',
            sale.car?.condition || 'N/A',
            new Date(sale.sale_date).toLocaleDateString(),
            sale.sale_price
        ]);

        // Combine into CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create Blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `trailblaze_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            toast.success('Report downloaded successfully');
        }, 500);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-6">
            <div className="max-w-7xl mx-auto space-y-8 font-sans">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Sales History</h1>
                        <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">Comprehensive record of all vehicle transactions and financial performance.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleExport} className="text-[10px] font-black uppercase tracking-widest h-10 border-slate-300 bg-white shadow-sm">
                            Export Report
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/admin/dashboard')} className="text-[10px] font-black uppercase tracking-widest h-10 border-slate-300 bg-white shadow-sm">
                            Dashboard
                        </Button>
                    </div>
                </div>

                {/* Metrics Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Sales</div>
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                </div>
                            </div>
                            <div className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{filteredSales.length}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Volume Count</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gross Revenue</div>
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>
                            <div id="net-revenue-stat" className="text-4xl font-black text-blue-600 mt-2 tracking-tighter">
                                ${filteredSales.reduce((acc, s) => acc + (s.sale_price || 0), 0).toLocaleString()}
                            </div>
                            <div className="text-[10px] font-bold text-blue-400 mt-1 uppercase tracking-widest">Total Value</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between text-slate-400">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em]">Average Sale</div>
                                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                </div>
                            </div>
                            <div className="text-4xl font-black text-white mt-2 tracking-tighter">
                                ${filteredSales.length ? Math.round(filteredSales.reduce((acc, s) => acc + (s.sale_price || 0), 0) / filteredSales.length).toLocaleString() : 0}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Per Unit</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Section */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-visible">
                    <CardContent className="p-4 md:p-5">
                        <div className="flex flex-col md:flex-row items-end gap-5">
                            {/* Search */}
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Search Records</label>
                                <div className="relative group">
                                    <input
                                        id="sales-search-input"
                                        type="text"
                                        placeholder="Search by Buyer, Brand or Vehicle Name..."
                                        className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
                                <div className="flex flex-col gap-2 min-w-[160px]">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vehicle Category</label>
                                    <select
                                        id="condition-filter"
                                        className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-700 outline-none hover:border-slate-300 focus:border-slate-900 transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}
                                        value={conditionFilter}
                                        onChange={(e) => setConditionFilter(e.target.value)}
                                    >
                                        <option value="All">All Conditions</option>
                                        <option value="New">Brand New</option>
                                        <option value="Used">Pre-Owned</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2 min-w-[160px]">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sort Hierarchy</label>
                                    <select
                                        id="sort-by-select"
                                        className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-700 outline-none hover:border-slate-300 focus:border-slate-900 transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="date_desc">Recent Sales</option>
                                        <option value="date_asc">Oldest Sales</option>
                                        <option value="price_desc">Highest Value</option>
                                        <option value="price_asc">Lowest Value</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Table Section */}
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-0">
                        <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Live Transaction Flow
                            </h2>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Showing {filteredSales.length} of {sales.length} Records
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table id="sales-ledger-table" className="w-full text-left border-collapse">
                                <thead className="text-[10px] text-slate-400 bg-white uppercase tracking-[0.2em] border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-6 font-black">Ref ID</th>
                                        <th className="px-6 py-6 font-black">Buyer</th>
                                        <th className="px-6 py-6 font-black">Vehicle</th>
                                        <th className="px-6 py-6 font-black">Date</th>
                                        <th className="px-6 py-6 text-right font-black">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 bg-white">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="p-24 text-center">
                                                <div className="inline-block w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-6">Synchronizing Data Node...</p>
                                            </td>
                                        </tr>
                                    ) : filteredSales.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-24 text-center">
                                                <div className="p-4 bg-slate-50 rounded-2xl inline-block mb-6 text-slate-200">
                                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                </div>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records matching your search criteria.</p>
                                                <button onClick={() => { setSearch(''); setConditionFilter('All'); }} className="mt-4 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline underline-offset-4 transition-all">Reset Filters</button>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSales.map(sale => (
                                            <tr key={sale._id} className={`hover:bg-slate-50/50 transition-all duration-300 group cursor-default ${String(sale.booking_id) === String(lastAcceptedId) ? 'bg-blue-50/50' : ''}`}>
                                                <td className="px-6 py-6">
                                                    <div className="font-mono text-[10px] font-bold text-slate-400">#TRB-{sale._id.slice(-8).toUpperCase()}</div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="font-bold text-slate-800 text-sm">{sale.buyer_name}</div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="font-black text-slate-900 text-sm">
                                                            {sale.car?.name.toLowerCase().startsWith(sale.car?.brand.toLowerCase()) ? sale.car?.name : `${sale.car?.brand} ${sale.car?.name}`}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span id="condition-badge" className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${sale.car?.condition === 'New' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                                {sale.car?.condition === 'New' ? 'Brand New' : 'Pre-Owned'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="text-slate-600 text-xs font-bold uppercase tracking-tight">
                                                        {new Date(sale.sale_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="font-black text-slate-900 text-lg tracking-tighter">
                                                        ${sale.sale_price?.toLocaleString()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SalesHistoryPage;

