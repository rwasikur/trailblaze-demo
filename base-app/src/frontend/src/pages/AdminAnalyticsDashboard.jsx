import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp, Download, RefreshCw, X } from 'lucide-react';
import api from '../api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const CHART_COLORS = ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#7c3aed', '#0891b2'];
const STATUS_COLORS = {
    Available: '#059669',   
    Sold: '#64748b',        
    Booked: '#f59e0b',     
    Pending: '#f59e0b',    
    Accepted: '#059669',    
    Rejected: '#ef4444',    
    Unavailable: '#ef4444' 
};

const EMPTY_FILTERS = { status: '', brand: '', fuelType: '', bodyType: '', condition: '', city: '' };

const formatCurrency = (value) => `$${(Number(value) || 0).toLocaleString()}`;
const formatNumber = (value) => (Number(value) || 0).toLocaleString();

const statusVariant = (status) => {
    const value = String(status || '').toLowerCase();
    if (value === 'available' || value === 'accepted') return 'available';
    if (value === 'pending') return 'pending';
    if (value === 'sold' || value === 'rejected' || value === 'unavailable') return 'unavailable';
    return 'outline';
};

const chartColor = (label, index) => STATUS_COLORS[label] || CHART_COLORS[index % CHART_COLORS.length];

const formatPeriod = (period) => {
    if (!period) return '';
    const [year, month] = String(period).split('-');
    if (!year || !month) return period;
    if (String(period).split('-').length === 3) {
        return new Date(period).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatLastUpdated = (value) => {
    if (!value) return 'Not refreshed yet';
    return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const sortLabel = (column, direction) => {
    if (column.sortLabel) {
        return direction === 'asc' ? column.sortLabel.asc : column.sortLabel.desc;
    }
    if (column.type === 'number' || column.align === 'right') {
        return direction === 'asc' ? 'Low-High' : 'High-Low';
    }
    if (column.type === 'date') {
        return direction === 'asc' ? 'Old-New' : 'New-Old';
    }
    return direction === 'asc' ? 'A-Z' : 'Z-A';
};

const exportRows = (filename, rows, columns) => {
    const csv = [
        columns.map(column => `"${column.label}"`).join(','),
        ...rows.map(row => columns.map(column => {
            const raw = column.exportValue ? column.exportValue(row) : row[column.key];
            return `"${String(raw ?? '').replace(/"/g, '""')}"`;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

const EmptyState = ({ children }) => (
    <div className="h-24 flex items-center justify-center text-zinc-500 text-sm text-center px-4">
        {children}
    </div>
);

const LoadingBlock = ({ className = '' }) => (
    <div className={`animate-pulse rounded-md bg-zinc-200/80 ${className}`} />
);

const LoadingMetricGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                <CardContent className="p-5 space-y-3">
                    <LoadingBlock className="h-3 w-24" />
                    <LoadingBlock className="h-9 w-32" />
                    <LoadingBlock className="h-3 w-20" />
                </CardContent>
            </Card>
        ))}
    </div>
);

const LoadingChart = () => (
    <Card className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 items-center">
            <LoadingBlock className="w-48 h-48 rounded-full mx-auto" />
            <div className="space-y-4">
                <LoadingBlock className="h-4 w-3/4" />
                <LoadingBlock className="h-4 w-2/3" />
                <LoadingBlock className="h-4 w-1/2" />
            </div>
        </CardContent>
    </Card>
);

const TrendText = ({ comparison }) => {
    if (!comparison) return null;
    if (comparison.delta === 0) return null;
    const direction = comparison.delta > 0 ? 'up' : comparison.delta < 0 ? 'down' : 'flat';
    const color = direction === 'up' ? 'text-emerald-600' : direction === 'down' ? 'text-red-600' : 'text-zinc-500';
    const label = comparison.deltaPercentage === null
        ? `${comparison.delta >= 0 ? '+' : ''}${formatNumber(comparison.delta)}`
        : `${comparison.delta >= 0 ? '+' : ''}${formatNumber(comparison.delta)} (${comparison.deltaPercentage}%)`;
    return <span className={`text-xs font-bold ${color}`}>{label}</span>;
};

const MetricCard = ({ id, label, value, subtext, trend, onClick }) => (
    <Card className={`border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] ${onClick ? 'cursor-pointer transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]' : ''}`}>
        <CardContent className="p-5" onClick={onClick}>
            <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
                <TrendText comparison={trend} />
            </div>
            <p id={id} className="text-[1.85rem] leading-tight font-black text-zinc-950 mt-2">
                {value}
            </p>
            {subtext && (
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    {subtext}
                </p>
            )}
        </CardContent>
    </Card>
);

const FleetStatusPieChart = ({ data }) => {
    const segments = useMemo(() => {
        const total = data.reduce((sum, item) => sum + item.count, 0);
        let offset = 0;

        return data.map((item, index) => {
            const value = total === 0 ? 0 : (item.count / total) * 100;
            const segment = `${chartColor(item.status, index)} ${offset}% ${offset + value}%`;
            offset += value;
            return segment;
        });
    }, [data]);

    if (!data.length) {
        return (
            <div id="fleet-status-empty" className="h-64 flex items-center justify-center text-slate-500">
                No fleet status data available.
            </div>
        );
    }

    return (
        <div id="fleet-status-chart" className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-center">
            <div
                role="img"
                aria-label="Fleet status distribution pie chart"
                className="w-56 h-56 rounded-full mx-auto border border-zinc-200 shadow-inner"
                style={{ background: `conic-gradient(${segments.join(', ')})` }}
            />

            <div className="space-y-3 max-w-sm">
                {data.map((item, index) => (
                    <div
                        key={item.status}
                        title={`${item.status}: ${item.count} vehicles, ${item.percentage}% of current fleet`}
                        className="w-full grid grid-cols-[1fr_auto] items-center gap-6 px-3 py-2 text-left"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: chartColor(item.status, index) }}
                            />
                            <span className="text-sm font-semibold text-zinc-700 truncate">
                                {item.status}
                            </span>
                        </div>
                        <span className="text-sm text-zinc-500 whitespace-nowrap">
                            {item.count} vehicles - {item.percentage}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DistributionBars = ({ data, labelKey, selectedValue = '', valueSuffix = 'vehicles', emptyLabel = 'No data available.', onSelect }) => {
    if (!data || !data.length) {
        return (
            <EmptyState>{emptyLabel}</EmptyState>
        );
    }

    return (
        <div className="space-y-4">
            {data.map((item, index) => (
                <button
                    type="button"
                    key={item[labelKey]}
                    title={`${item[labelKey]}: ${item.count} ${valueSuffix}, ${item.percentage}% of current result`}
                    onClick={() => onSelect?.(item[labelKey])}
                    className={`w-full text-left rounded-lg p-2 -m-2 transition-colors ${selectedValue === item[labelKey] ? 'bg-zinc-100 ring-1 ring-zinc-300' : onSelect ? 'hover:bg-zinc-50' : ''}`}
                >
                    <div className="flex justify-between items-center gap-4 mb-1">
                        <span className="text-sm font-semibold text-zinc-700 truncate">{item[labelKey]}</span>
                        <span className="text-sm text-zinc-500 whitespace-nowrap">
                            {item.count} {valueSuffix} - {item.percentage}%
                        </span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                                width: `${item.percentage}%`,
                                backgroundColor: chartColor(item[labelKey], index)
                            }}
                        />
                    </div>
                </button>
            ))}
        </div>
    );
};

const ExportMenu = ({ exports }) => {
    const enabledExports = exports.filter(item => item.rows.length);
    const [selected, setSelected] = useState(exports[0]?.key || '');
    const active = exports.find(item => item.key === selected) || exports[0];

    useEffect(() => {
        if (!exports.some(item => item.key === selected)) {
            setSelected(exports[0]?.key || '');
        }
    }, [exports, selected]);

    return (
        <div className="flex flex-col sm:flex-row gap-2">
            <select
                value={selected}
                onChange={event => setSelected(event.target.value)}
                className="h-10 px-3 text-sm border border-zinc-200 rounded-md bg-white text-zinc-900 outline-none focus:border-zinc-500"
            >
                {exports.map(item => (
                    <option key={item.key} value={item.key} disabled={!item.rows.length}>
                        {item.label}
                    </option>
                ))}
            </select>
            <Button
                variant="slate"
                onClick={() => active && exportRows(active.filename, active.rows, active.columns)}
                disabled={!enabledExports.length || !active?.rows.length}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
                <Download size={16} />
                Export CSV
            </Button>
        </div>
    );
};

const SmartTable = ({ title, columns, rows, emptyLabel, actions }) => {
    const [sortKey, setSortKey] = useState(columns[0]?.key || '');
    const [sortDirection, setSortDirection] = useState('asc');

    const visibleRows = useMemo(() => {
        return [...rows].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return sortDirection === 'asc'
                ? String(aValue ?? '').localeCompare(String(bValue ?? ''))
                : String(bValue ?? '').localeCompare(String(aValue ?? ''));
        });
    }, [rows, sortDirection, sortKey]);

    const setSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    return (
        <Card className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                    <h2 className="text-lg font-bold text-slate-900 m-0">{title}</h2>
                </div>

                {!visibleRows.length ? (
                    <EmptyState>{emptyLabel}</EmptyState>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-zinc-100">
                        <table className="w-full text-left border-collapse">
                            <thead className="text-[10px] text-zinc-500 bg-zinc-50 uppercase tracking-[0.16em] border-b border-zinc-100">
                                <tr>
                                    {columns.map(column => (
                                        <th key={column.key} className={`px-4 py-3 font-black ${column.align === 'right' ? 'text-right' : ''}`}>
                                            <button type="button" className={`inline-flex items-center gap-1 hover:text-zinc-900 transition-colors ${column.align === 'right' ? 'justify-end w-full' : ''}`} onClick={() => setSort(column.key)}>
                                                {column.label}
                                                {sortKey === column.key && (
                                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black normal-case tracking-normal text-zinc-600 ring-1 ring-zinc-200">
                                                        {sortLabel(column, sortDirection)}
                                                        {sortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                                    </span>
                                                )}
                                            </button>
                                        </th>
                                    ))}
                                    {actions && <th className="px-4 py-3 font-black text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {visibleRows.map((row, rowIndex) => (
                                    <tr key={row.id || row.carId || row.bookingId || row.saleId || row.period || rowIndex} className="hover:bg-zinc-50/70 transition-colors">
                                        {columns.map(column => (
                                            <td key={column.key} className={`px-4 py-3 text-sm text-zinc-700 font-semibold ${column.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                                                {column.badge ? (
                                                    <Badge variant={statusVariant(row[column.key])}>{row[column.key]}</Badge>
                                                ) : column.render ? column.render(row) : row[column.key]}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-4 py-3 text-right">
                                                {actions(row)}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const AdminAnalyticsDashboard = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [analyticsError, setAnalyticsError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [range, setRange] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [detailView, setDetailView] = useState('inventory');
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [distributionView, setDistributionView] = useState('inventory');

    const queryParams = useMemo(() => ({
        range,
        startDate,
        endDate,
        ...filters
    }), [endDate, filters, range, startDate]);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            navigate('/admin');
            return;
        }

        fetchAnalytics();
    }, [navigate, queryParams]);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            setAnalyticsError('');
            const { data } = await api.get('/api/cars/analytics/summary', { params: queryParams });
            setAnalytics(data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch fleet analytics:', err);
            setAnalytics(null);
            setAnalyticsError('Unable to load fleet analytics. Select Retry to request the latest data.');
        } finally {
            setIsLoading(false);
        }
    };

    const retryAnalytics = () => fetchAnalytics();

    const updateFilter = (key, value) => {
        setFilters(current => ({ ...current, [key]: current[key] === value ? '' : value }));
    };

    const resetFilters = () => {
        setFilters(EMPTY_FILTERS);
        setRange('all');
        setStartDate('');
        setEndDate('');
    };

    const handleBookingStatus = async (bookingId, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/api/bookings/admin/${bookingId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Booking ${status.toLowerCase()}.`);
            fetchAnalytics();
        } catch (err) {
            console.error('Failed to update booking:', err);
            toast.error('Failed to update booking status.');
        }
    };

    const openMetric = (label, value, description) => {
        setSelectedMetric({ label, value, description });
    };

    const openMetricDetail = (view, label, value, description) => {
        setDetailView(view);
        openMetric(label, value, description);
    };

    const options = analytics?.filterOptions || {};
    const newCondition = analytics?.conditionDistribution?.find(item => item.condition === 'New');
    const usedCondition = analytics?.conditionDistribution?.find(item => item.condition === 'Used');
    const modelYearRange = analytics?.oldestModelYear && analytics?.newestModelYear
        ? `${analytics.oldestModelYear} - ${analytics.newestModelYear}`
        : '';

    const hasActiveFilters = range !== 'all' || startDate || endDate || Object.values(filters).some(Boolean);
    const activeFilterItems = [
        range !== 'all' ? { key: 'range', label: 'Range', value: range === 'custom' ? 'Custom' : `Last ${range} days`, clear: () => setRange('all') } : null,
        startDate ? { key: 'startDate', label: 'Start', value: startDate, clear: () => setStartDate('') } : null,
        endDate ? { key: 'endDate', label: 'Finish', value: endDate, clear: () => setEndDate('') } : null,
        ...Object.entries(filters).filter(([, value]) => value).map(([key, value]) => ({
            key,
            label: { fuelType: 'Fuel', bodyType: 'Body', city: 'City', brand: 'Brand', condition: 'Condition', status: 'Status' }[key] || key,
            value,
            clear: () => updateFilter(key, value)
        }))
    ].filter(Boolean);

    const filterContext = activeFilterItems.length
        ? ` for ${activeFilterItems.map(item => `${item.label.toLowerCase()} ${item.value}`).join(', ')}`
        : '';

    const inventoryColumns = [
        { key: 'vehicle', label: 'Vehicle' },
        { key: 'brand', label: 'Brand' },
        { key: 'status', label: 'Status', badge: true },
        { key: 'condition', label: 'Condition', badge: true },
        { key: 'fuelType', label: 'Fuel' },
        { key: 'bodyType', label: 'Body' },
        { key: 'city', label: 'City' },
        { key: 'price', label: 'Price', type: 'number', align: 'right', render: row => formatCurrency(row.price), exportValue: row => row.price }
    ];

    const bookingColumns = [
        { key: 'customer', label: 'Customer' },
        { key: 'status', label: 'Status', badge: true },
        { key: 'vehicle', label: 'Vehicle' },
        { key: 'price', label: 'Price', type: 'number', align: 'right', render: row => formatCurrency(row.price), exportValue: row => row.price },
        { key: 'ageDays', label: 'Age', type: 'number', align: 'right', render: row => `${row.ageDays} days`, exportValue: row => row.ageDays }
    ];

    const pendingBookingColumns = [
        { key: 'customer', label: 'Customer' },
        { key: 'vehicle', label: 'Vehicle' },
        { key: 'price', label: 'Price', type: 'number', align: 'right', render: row => formatCurrency(row.price), exportValue: row => row.price }
    ];

    const salesColumns = [
        { key: 'vehicle', label: 'Vehicle' },
        { key: 'buyer', label: 'Buyer' },
        { key: 'status', label: 'Status', badge: true },
        { key: 'saleDate', label: 'Date', type: 'date', render: row => new Date(row.saleDate).toLocaleDateString() },
        { key: 'price', label: 'Price', type: 'number', align: 'right', render: row => formatCurrency(row.price), exportValue: row => row.price }
    ];

    const trendSalesColumns = [
        { key: 'period', label: 'Month', render: row => formatPeriod(row.period), exportValue: row => formatPeriod(row.period) },
        { key: 'vehiclesSold', label: 'Sold', type: 'number', align: 'right' },
        { key: 'revenue', label: 'Revenue', type: 'number', align: 'right', render: row => formatCurrency(row.revenue), exportValue: row => row.revenue }
    ];

    const trendBookingColumns = [
        { key: 'period', label: 'Month', render: row => formatPeriod(row.period), exportValue: row => formatPeriod(row.period) },
        { key: 'bookings', label: 'Bookings', type: 'number', align: 'right' }
    ];

    const detailConfig = {
        inventory: { title: 'Vehicle Inventory', rows: analytics?.carRows || [], columns: inventoryColumns, empty: `No vehicles match the current filters${filterContext}.`, filename: 'vehicle-inventory.csv' },
        bookings: { title: 'Booking Detail', rows: analytics?.bookingRows || [], columns: bookingColumns, empty: `No bookings match the current filters${filterContext}.`, filename: 'booking-detail.csv' },
        pending: { title: 'Pending Bookings', rows: analytics?.pendingBookingAge || [], columns: bookingColumns, empty: `No pending bookings match the current filters${filterContext}.`, filename: 'pending-bookings.csv' },
        sales: { title: 'Sales Detail', rows: analytics?.saleRows || [], columns: salesColumns, empty: `No sales match the current filters${filterContext}.`, filename: 'sales-detail.csv' }
    }[detailView];

    const exportOptions = [
        { key: 'inventory', label: 'Vehicle inventory', rows: analytics?.carRows || [], columns: inventoryColumns, filename: 'vehicle-inventory.csv' },
        { key: 'bookings', label: 'Booking detail', rows: analytics?.bookingRows || [], columns: bookingColumns, filename: 'booking-detail.csv' },
        { key: 'pending', label: 'Pending bookings', rows: analytics?.pendingBookingAge || [], columns: bookingColumns, filename: 'pending-bookings.csv' },
        { key: 'sales', label: 'Sales detail', rows: analytics?.saleRows || [], columns: salesColumns, filename: 'sales-detail.csv' },
        { key: 'monthlySales', label: 'Monthly sales', rows: analytics?.salesByMonth || [], columns: trendSalesColumns, filename: 'monthly-sales.csv' },
        { key: 'monthlyBookings', label: 'Monthly bookings', rows: analytics?.bookingsByMonth || [], columns: trendBookingColumns, filename: 'monthly-bookings.csv' },
        {
            key: 'demand',
            label: 'Demand by vehicle',
            rows: analytics?.demandByVehicle || [],
            filename: 'demand-by-vehicle.csv',
            columns: [
                { key: 'vehicle', label: 'Vehicle' },
                { key: 'bookingCount', label: 'Bookings', type: 'number' },
                { key: 'price', label: 'Price', type: 'number', exportValue: row => row.price }
            ]
        }
    ];

    const SectionTitle = ({ children }) => (
        <h2 className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500 mb-3">{children}</h2>
    );

    return (
        <div className="min-h-full bg-zinc-50 py-8 px-4 md:px-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 id="analytics-dashboard-heading" className="text-3xl font-black text-zinc-950 font-display tracking-tight">
                            Analytics Dashboard
                        </h1>
                        <p className="text-zinc-500 mt-2 text-base">
                            Review fleet health, bookings, sales, demand, and inventory movement.
                        </p>
                        <p className="text-xs font-semibold text-zinc-400 mt-1">
                            Last updated {formatLastUpdated(lastUpdated)}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={retryAnalytics} disabled={isLoading} className="text-sm font-semibold h-11 border-slate-300 gap-2">
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                            Refresh
                        </Button>
                        <Button
                            id="back-to-admin-dashboard-button"
                            variant="outline"
                            onClick={() => navigate('/admin/dashboard')}
                            className="text-sm font-semibold h-11 border-slate-300"
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </div>

                {analyticsError && (
                    <Card className="border-red-100 shadow-sm bg-white">
                        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <p id="analytics-error-message" className="text-sm font-semibold text-red-600">
                                    {analyticsError}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">The dashboard is showing no analytics until the next successful request.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button id="analytics-retry-button" variant="outline" size="sm" onClick={retryAnalytics}>
                                    Retry
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                                    Back to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {selectedMetric && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 px-4 backdrop-blur-sm" onClick={() => setSelectedMetric(null)}>
                        <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-zinc-200" onClick={event => event.stopPropagation()}>
                            <div className="p-5 border-b border-zinc-100">
                                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500">{selectedMetric.label}</p>
                                <p className="text-4xl font-black text-zinc-950 mt-2">{selectedMetric.value}</p>
                            </div>
                            <div className="p-5 space-y-5">
                                <p className="text-sm text-zinc-600 leading-6">{selectedMetric.description}</p>
                                <div className="flex justify-end">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedMetric(null)}>Close</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Card className="sticky top-3 z-30 border-zinc-200 bg-white/95 backdrop-blur shadow-[0_8px_28px_rgba(15,23,42,0.08)]">
                    <CardContent className="p-5 space-y-5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 m-0">Filters</h2>
                                <p className="text-xs text-zinc-500 mt-1">Narrow the dashboard without leaving this page.</p>
                            </div>
                            {hasActiveFilters && <Button variant="outline" onClick={resetFilters}>Clear all</Button>}
                        </div>

                        {activeFilterItems.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {activeFilterItems.map(item => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={item.clear}
                                        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-100"
                                    >
                                        <span className="text-zinc-500">{item.label}:</span>
                                        {item.value}
                                        <X size={13} />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className={`grid grid-cols-1 md:grid-cols-2 ${range === 'custom' ? 'lg:grid-cols-5' : 'lg:grid-cols-3'} gap-3`}>
                            <select value={range} onChange={event => setRange(event.target.value)} className="h-10 px-3 text-sm border border-zinc-200 rounded-md bg-white text-zinc-900 outline-none focus:border-zinc-500">
                                <option value="all">All time</option>
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="custom">Custom</option>
                            </select>
                            {range === 'custom' && (
                                <>
                                    <label className="space-y-1">
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Start Date</span>
                                        <input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} className="h-10 w-full px-3 text-sm border border-zinc-200 rounded-md outline-none focus:border-zinc-500" />
                                    </label>
                                    <label className="space-y-1">
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Finish Date</span>
                                        <input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} className="h-10 w-full px-3 text-sm border border-zinc-200 rounded-md outline-none focus:border-zinc-500" />
                                    </label>
                                </>
                            )}
                            <select value={filters.brand} onChange={event => updateFilter('brand', event.target.value)} className="h-10 px-3 text-sm border border-zinc-200 rounded-md bg-white text-zinc-900 outline-none focus:border-zinc-500">
                                <option value="">All brands</option>
                                {(options.brands || []).map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                            <select value={filters.fuelType} onChange={event => updateFilter('fuelType', event.target.value)} className="h-10 px-3 text-sm border border-zinc-200 rounded-md bg-white text-zinc-900 outline-none focus:border-zinc-500">
                                <option value="">All fuel types</option>
                                {(options.fuelTypes || []).map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <select value={filters.bodyType} onChange={event => updateFilter('bodyType', event.target.value)} className="h-10 px-3 text-sm border border-zinc-200 rounded-md bg-white text-zinc-900 outline-none focus:border-zinc-500">
                                <option value="">All body types</option>
                                {(options.bodyTypes || []).map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                            <select value={filters.condition} onChange={event => updateFilter('condition', event.target.value)} className="h-10 px-3 text-sm border border-zinc-200 rounded-md bg-white text-zinc-900 outline-none focus:border-zinc-500">
                                <option value="">All conditions</option>
                                {(options.conditions || []).map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                            <select value={filters.city} onChange={event => updateFilter('city', event.target.value)} className="h-10 px-3 text-sm border border-zinc-200 rounded-md bg-white text-zinc-900 outline-none focus:border-zinc-500">
                                <option value="">All cities</option>
                                {(options.cities || []).map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                            <select value={filters.status} onChange={event => updateFilter('status', event.target.value)} className="h-10 px-3 text-sm border border-zinc-200 rounded-md bg-white text-zinc-900 outline-none focus:border-zinc-500">
                                <option value="">All statuses</option>
                                {(options.statuses || []).map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {isLoading && !analytics ? (
                    <LoadingMetricGrid />
                ) : (
                    <div className="space-y-6">
                        <section>
                            <SectionTitle>Inventory</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard id="metric-total-fleet" label="Total Fleet" value={analytics?.totalFleet ?? 0} onClick={() => openMetricDetail('inventory', 'Total Fleet', analytics?.totalFleet ?? 0, 'Number of vehicles in the catalogue.')} />
                                <MetricCard id="metric-total-inventory-value" label="Inventory Value" value={formatCurrency(analytics?.totalInventoryValue)} onClick={() => openMetricDetail('inventory', 'Inventory Value', formatCurrency(analytics?.totalInventoryValue), 'Total listed value of all vehicles.')} />
                                <MetricCard id="metric-available-inventory-value" label="Available Value" value={formatCurrency(analytics?.availableInventoryValue)} onClick={() => openMetricDetail('inventory', 'Available Value', formatCurrency(analytics?.availableInventoryValue), 'Total listed value of available vehicles.')} />
                                <MetricCard id="metric-average-listing-price" label="Avg Listing Price" value={formatCurrency(analytics?.averageListingPrice)} onClick={() => openMetricDetail('inventory', 'Avg Listing Price', formatCurrency(analytics?.averageListingPrice), 'Average price of vehicles in the catalogue.')} />
                            </div>
                        </section>

                        <section>
                            <SectionTitle>Bookings</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard id="metric-total-bookings" label="Total Bookings" value={analytics?.totalBookings ?? 0} trend={analytics?.comparisons?.bookings} onClick={() => openMetricDetail('bookings', 'Total Bookings', analytics?.totalBookings ?? 0, 'Total customer booking requests.')} />
                                <MetricCard id="metric-pending-bookings" label="Pending Bookings" value={analytics?.pendingBookings ?? 0} onClick={() => openMetricDetail('pending', 'Pending Bookings', analytics?.pendingBookings ?? 0, 'Booking requests waiting for a decision.')} />
                                <MetricCard id="metric-accepted-bookings" label="Accepted Bookings" value={analytics?.acceptedBookings ?? 0} trend={analytics?.comparisons?.acceptedBookings} onClick={() => openMetricDetail('bookings', 'Accepted Bookings', analytics?.acceptedBookings ?? 0, 'Booking requests approved by admin.')} />
                                <MetricCard id="metric-booking-conversion-rate" label="Booking Acceptance Rate" value={`${analytics?.bookingConversionRate ?? 0}%`} onClick={() => openMetricDetail('bookings', 'Booking Acceptance Rate', `${analytics?.bookingConversionRate ?? 0}%`, 'Share of bookings that were accepted.')} />
                                <MetricCard id="metric-rejected-bookings" label="Rejected Bookings" value={analytics?.rejectedBookings ?? 0} onClick={() => openMetricDetail('bookings', 'Rejected Bookings', analytics?.rejectedBookings ?? 0, 'Booking requests declined by admin.')} />
                                <MetricCard id="metric-pending-pipeline-value" label="Pending Pipeline" value={formatCurrency(analytics?.pendingPipelineValue)} onClick={() => openMetricDetail('pending', 'Pending Pipeline', formatCurrency(analytics?.pendingPipelineValue), 'Vehicle value tied to pending bookings.')} />
                                <MetricCard id="metric-accepted-booking-value" label="Accepted Pipeline" value={formatCurrency(analytics?.acceptedBookingValue)} onClick={() => openMetricDetail('bookings', 'Accepted Pipeline', formatCurrency(analytics?.acceptedBookingValue), 'Vehicle value tied to accepted bookings.')} />
                            </div>
                        </section>

                        <section>
                            <SectionTitle>Sales And Risk</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard id="metric-total-sales-revenue" label="Total Sales Revenue" value={formatCurrency(analytics?.totalSalesRevenue)} trend={analytics?.comparisons?.salesRevenue} onClick={() => openMetricDetail('sales', 'Total Sales Revenue', formatCurrency(analytics?.totalSalesRevenue), 'Revenue from recorded vehicle sales.')} />
                                <MetricCard id="metric-average-fleet-age" label="Avg Fleet Age" value={`${analytics?.averageFleetAge ?? 0} yrs`} subtext={modelYearRange} onClick={() => openMetricDetail('inventory', 'Avg Fleet Age', `${analytics?.averageFleetAge ?? 0} yrs`, 'Average age based on vehicle model year.')} />
                                <MetricCard id="metric-new-count" label="Brand New" value={newCondition?.count ?? 0} subtext={`${newCondition?.percentage ?? 0}% of fleet`} onClick={() => openMetricDetail('inventory', 'Brand New', newCondition?.count ?? 0, 'Number of new vehicles.')} />
                                <MetricCard id="metric-used-count" label="Pre-Owned" value={usedCondition?.count ?? 0} subtext={`${usedCondition?.percentage ?? 0}% of fleet`} onClick={() => openMetricDetail('inventory', 'Pre-Owned', usedCondition?.count ?? 0, 'Number of used vehicles.')} />
                                <MetricCard id="metric-expired-insurance" label="Expired Insurance" value={analytics?.expiredInsuranceCount ?? 0} onClick={() => openMetricDetail('inventory', 'Expired Insurance', analytics?.expiredInsuranceCount ?? 0, 'Vehicles with expired insurance.')} />
                                <MetricCard id="metric-expiring-insurance" label="Expiring Soon" value={analytics?.insuranceExpiringSoonCount ?? 0} subtext="Next 30 days" onClick={() => openMetricDetail('inventory', 'Expiring Soon', analytics?.insuranceExpiringSoonCount ?? 0, 'Vehicles with insurance expiring soon.')} />
                            </div>
                        </section>
                    </div>
                )}

                {isLoading && !analytics ? (
                    <LoadingChart />
                ) : (
                    <Card className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <h2 className="text-lg font-bold text-slate-900 m-0">Fleet Status Distribution</h2>
                            </div>
                            <FleetStatusPieChart
                                data={analytics?.statusDistribution || []}
                            />
                        </CardContent>
                    </Card>
                )}

                <Card className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-slate-900 m-0">Breakdowns</h2>
                            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                                {[
                                    ['inventory', 'Fleet Composition'],
                                    ['demand', 'Booking Demand'],
                                    ['location', 'Market Locations']
                                ].map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setDistributionView(key)}
                                        className={`rounded-md px-3 py-1.5 text-xs font-black transition-colors ${distributionView === key ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {distributionView === 'inventory' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-5">Top Inventory Brands</h3>
                                    <DistributionBars data={analytics?.brandDistribution || []} labelKey="brand" selectedValue={filters.brand} emptyLabel={`No brand data available${filterContext}.`} onSelect={(brand) => updateFilter('brand', brand)} />
                                </div>
                                <div className="space-y-10">
                                    <div id={(analytics?.fuelTypeDistribution || []).length ? 'fuel-type-breakdown' : 'fuel-type-empty'}>
                                        <h3 className="text-sm font-bold text-slate-900 mb-5">Fuel Type Breakdown</h3>
                                        <DistributionBars data={analytics?.fuelTypeDistribution || []} labelKey="fuelType" selectedValue={filters.fuelType} emptyLabel={`No fuel type data available${filterContext}.`} onSelect={(fuelType) => updateFilter('fuelType', fuelType)} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-5">Transmission Mix</h3>
                                        <DistributionBars data={analytics?.transmissionDistribution || []} labelKey="transmission" emptyLabel={`No transmission data available${filterContext}.`} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-5">Body Type Distribution</h3>
                                    <DistributionBars data={analytics?.bodyTypeDistribution || []} labelKey="bodyType" selectedValue={filters.bodyType} emptyLabel={`No body type data available${filterContext}.`} onSelect={(bodyType) => updateFilter('bodyType', bodyType)} />
                                </div>
                            </div>
                        )}

                        {distributionView === 'demand' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="space-y-10">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-5">Booking Funnel</h3>
                                        <DistributionBars data={analytics?.bookingStatusDistribution || []} labelKey="status" valueSuffix="bookings" emptyLabel={`No booking status data available${filterContext}.`} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-5">Demand By Body Type</h3>
                                        <DistributionBars data={analytics?.demandByBodyType || []} labelKey="bodyType" selectedValue={filters.bodyType} valueSuffix="bookings" emptyLabel={`No body demand data available${filterContext}.`} onSelect={(bodyType) => updateFilter('bodyType', bodyType)} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-5">Demand By Brand</h3>
                                    <DistributionBars data={analytics?.demandByBrand || []} labelKey="brand" selectedValue={filters.brand} valueSuffix="bookings" emptyLabel={`No brand demand data available${filterContext}.`} onSelect={(brand) => updateFilter('brand', brand)} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-5">Demand By Fuel Type</h3>
                                    <DistributionBars data={analytics?.demandByFuelType || []} labelKey="fuelType" selectedValue={filters.fuelType} valueSuffix="bookings" emptyLabel={`No fuel demand data available${filterContext}.`} onSelect={(fuelType) => updateFilter('fuelType', fuelType)} />
                                </div>
                            </div>
                        )}

                        {distributionView === 'location' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-5">Registration Cities</h3>
                                    <DistributionBars data={analytics?.registrationCityDistribution || []} labelKey="city" selectedValue={filters.city} emptyLabel={`No city data available${filterContext}.`} onSelect={(city) => updateFilter('city', city)} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-5">Demand By Vehicle</h3>
                                    {(analytics?.demandByVehicle || []).length ? (
                                        <div className="overflow-x-auto rounded-lg border border-zinc-100">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="text-[10px] text-zinc-500 bg-zinc-50 uppercase tracking-[0.16em] border-b border-zinc-100">
                                                    <tr>
                                                        <th className="px-4 py-3 font-black">Vehicle</th>
                                                        <th className="px-4 py-3 font-black text-right">Bookings</th>
                                                        <th className="px-4 py-3 font-black text-right">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100">
                                                    {(analytics?.demandByVehicle || []).map(row => (
                                                        <tr key={row.carId} className="hover:bg-zinc-50/70 transition-colors">
                                                            <td className="px-4 py-3 text-sm text-zinc-700 font-semibold">{row.vehicle}</td>
                                                            <td className="px-4 py-3 text-sm text-zinc-700 font-semibold text-right tabular-nums">{row.bookingCount}</td>
                                                            <td className="px-4 py-3 text-sm text-zinc-700 font-semibold text-right tabular-nums">{formatCurrency(row.price)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <EmptyState>{`No demand data available${filterContext}.`}</EmptyState>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                    <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 m-0">Exports</h2>
                            <p className="text-xs text-zinc-500 mt-1">Download the current analytics table data.</p>
                        </div>
                        <ExportMenu exports={exportOptions} />
                    </CardContent>
                </Card>

                <SmartTable
                    title={detailConfig.title}
                    rows={detailConfig.rows}
                    columns={detailConfig.columns}
                    emptyLabel={detailConfig.empty}
                    filename={detailConfig.filename}
                    actions={detailView === 'pending' ? (row) => (
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="slate" onClick={() => handleBookingStatus(row.bookingId, 'Accepted')}>Accept</Button>
                            <Button size="sm" variant="outline" onClick={() => handleBookingStatus(row.bookingId, 'Rejected')}>Reject</Button>
                        </div>
                    ) : null}
                />

                <SmartTable
                    title="Pending Bookings"
                    rows={analytics?.pendingBookingAge || []}
                    emptyLabel="No pending bookings."
                    filename="pending-booking-age.csv"
                    columns={pendingBookingColumns}
                    actions={(row) => (
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="slate" onClick={() => handleBookingStatus(row.bookingId, 'Accepted')}>Accept</Button>
                            <Button size="sm" variant="outline" onClick={() => handleBookingStatus(row.bookingId, 'Rejected')}>Reject</Button>
                        </div>
                    )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SmartTable
                        title="Monthly Sales"
                        rows={analytics?.salesByMonth || []}
                        emptyLabel="No sales trend data available."
                        filename="monthly-sales.csv"
                        columns={trendSalesColumns}
                    />

                    <SmartTable
                        title="Monthly Bookings"
                        rows={analytics?.bookingsByMonth || []}
                        emptyLabel="No booking trend data available."
                        filename="monthly-bookings.csv"
                        columns={trendBookingColumns}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsDashboard;
