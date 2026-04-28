import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const CHART_COLORS = ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#7c3aed', '#0891b2'];

const FleetStatusPieChart = ({ data }) => {
    const segments = useMemo(() => {
        const total = data.reduce((sum, item) => sum + item.count, 0);
        let offset = 0;

        return data.map((item, index) => {
            const value = total === 0 ? 0 : (item.count / total) * 100;
            const segment = `${CHART_COLORS[index % CHART_COLORS.length]} ${offset}% ${offset + value}%`;
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
                className="w-56 h-56 rounded-full mx-auto border border-slate-200"
                style={{ background: `conic-gradient(${segments.join(', ')})` }}
            />

            <div className="space-y-3 max-w-sm">
                {data.map((item, index) => (
                    <div key={item.status} className="grid grid-cols-[1fr_auto] items-center gap-6">
                        <div className="flex items-center gap-3 min-w-0">
                            <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="text-sm font-semibold text-slate-700 truncate">
                                {item.status}
                            </span>
                        </div>
                        <span className="text-sm text-slate-500 whitespace-nowrap">
                            {item.count} vehicles - {item.percentage}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FUEL_COLORS = {
    Electric: '#2563eb',
    Petrol:   '#dc2626',
    Diesel:   '#92400e',
    Hybrid:   '#16a34a',
};

const FuelTypeBreakdown = ({ data }) => {
    if (!data || !data.length) {
        return (
            <div id="fuel-type-empty" className="h-24 flex items-center justify-center text-slate-500 text-sm">
                No fuel type data available.
            </div>
        );
    }
    return (
        <div id="fuel-type-breakdown" className="space-y-4">
            {data.map((item) => (
                <div key={item.fuelType}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-slate-700">{item.fuelType}</span>
                        <span className="text-sm text-slate-500">{item.count} vehicles - {item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                                width: `${item.percentage}%`,
                                backgroundColor: FUEL_COLORS[item.fuelType] || '#7c3aed'
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const BODY_COLORS = {
    Sedan:     '#2563eb',
    SUV:       '#16a34a',
    Coupe:     '#f97316',
    Hatchback: '#7c3aed',
    Truck:     '#0891b2',
};

const BodyTypeBreakdown = ({ data }) => {
    if (!data || !data.length) {
        return (
            <div id="body-type-empty" className="h-24 flex items-center justify-center text-slate-500 text-sm">
                No body type data available.
            </div>
        );
    }
    return (
        <div id="body-type-breakdown" className="space-y-4">
            {data.map((item) => (
                <div key={item.bodyType}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-slate-700">{item.bodyType}</span>
                        <span className="text-sm text-slate-500">{item.count} vehicles - {item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                                width: `${item.percentage}%`,
                                backgroundColor: BODY_COLORS[item.bodyType] || '#dc2626'
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const MetricCard = ({ id, label, value, subtext }) => (
    <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
            <p id={id} className="text-3xl font-extrabold text-slate-900 mt-2">
                {value}
            </p>
            {subtext && (
                <p className="text-xs font-semibold text-slate-400 mt-1">
                    {subtext}
                </p>
            )}
        </CardContent>
    </Card>
);

const DistributionBars = ({ data, labelKey, emptyLabel = 'No data available.' }) => {
    if (!data || !data.length) {
        return (
            <div className="h-24 flex items-center justify-center text-slate-500 text-sm">
                {emptyLabel}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.map((item, index) => (
                <div key={item[labelKey]}>
                    <div className="flex justify-between items-center gap-4 mb-1">
                        <span className="text-sm font-semibold text-slate-700 truncate">{item[labelKey]}</span>
                        <span className="text-sm text-slate-500 whitespace-nowrap">
                            {item.count} vehicles - {item.percentage}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                                width: `${item.percentage}%`,
                                backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const formatCurrency = (value) => `$${(value ?? 0).toLocaleString()}`;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [analyticsError, setAnalyticsError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            navigate('/admin');
            return;
        }

        fetchCars(token);
        fetchAnalytics();
    }, [navigate]);

    const fetchCars = async (token) => {
        try {
            const { data } = await api.get('/api/cars/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(data || []);
        } catch (err) {
            console.error('Failed to fetch cars:', err);
            setCars([]);
        }
    };

    const fetchAnalytics = async (token) => {
        try {
            setAnalyticsError('');
            const { data } = await api.get('/api/cars/analytics/summary');
            setAnalytics(data);
        } catch (err) {
            console.error('Failed to fetch fleet analytics:', err);
            setAnalytics(null);
            setAnalyticsError('Unable to load fleet analytics. Select Retry to request the latest data.');
        }
    };

    const retryAnalytics = () => {
        const token = localStorage.getItem('adminToken');
        if (token) fetchAnalytics();
    };

    const newCondition = analytics?.conditionDistribution?.find(item => item.condition === 'New');
    const usedCondition = analytics?.conditionDistribution?.find(item => item.condition === 'Used');

    const newCount = newCondition?.count ?? 0;
    const usedCount = usedCondition?.count ?? 0;
    const newPercentage = newCondition?.percentage ?? 0;
    const usedPercentage = usedCondition?.percentage ?? 0;
    const modelYearRange = analytics?.oldestModelYear && analytics?.newestModelYear
        ? `${analytics.oldestModelYear} - ${analytics.newestModelYear}`
        : '';

    return (
        <div className="min-h-full bg-slate-50 py-10 px-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 id="dashboard-heading" className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-slate-500 mt-2 text-base">
                            Manage your vehicle Catalogue and system operations.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin/catalogue')}
                            className="text-sm font-semibold h-11 border-slate-300"
                        >
                            Manage Catalogue
                        </Button>
                        <Button
                            id="add-car-button"
                            onClick={() => navigate('/admin/add-car')}
                            className="text-sm font-semibold h-11"
                            variant="slate"
                        >
                            + Add New Vehicle
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        id="metric-total-fleet"
                        label="Total Fleet"
                        value={analytics?.totalFleet ?? 0}
                    />
                    <MetricCard
                        id="metric-available-count"
                        label="Available"
                        value={analytics?.availableCount ?? 0}
                    />
                    <MetricCard
                        id="metric-unavailable-count"
                        label="Unavailable"
                        value={analytics?.unavailableCount ?? 0}
                    />
                    <MetricCard
                        id="metric-availability-rate"
                        label="Availability Rate"
                        value={`${analytics?.availabilityRate ?? 0}%`}
                    />
                    <MetricCard
                        id="metric-average-daily-rate"
                        label="Avg Daily Rate"
                        value={formatCurrency(analytics?.averageDailyRate)}
                    />
                    <MetricCard
                        id="metric-available-daily-rate"
                        label="Available Daily Capacity"
                        value={formatCurrency(analytics?.availableDailyRate)}
                    />
                    <MetricCard
                        id="metric-average-fleet-age"
                        label="Avg Fleet Age"
                        value={`${analytics?.averageFleetAge ?? 0} yrs`}
                        subtext={modelYearRange}
                    />
                    <MetricCard
                        id="metric-new-count"
                        label="Brand New"
                        value={newCount}
                        subtext={`${newPercentage}% of fleet`}
                    />
                    <MetricCard
                        id="metric-used-count"
                        label="Pre-Owned"
                        value={usedCount}
                        subtext={`${usedPercentage}% of fleet`}
                    />
                    <MetricCard
                        id="metric-expired-insurance"
                        label="Expired Insurance"
                        value={analytics?.expiredInsuranceCount ?? 0}
                    />
                    <MetricCard
                        id="metric-expiring-insurance"
                        label="Expiring Soon"
                        value={analytics?.insuranceExpiringSoonCount ?? 0}
                        subtext="Next 30 days"
                    />
                    <MetricCard
                        id="metric-total-sales-revenue"
                        label="Total Sales Revenue"
                        value={formatCurrency(analytics?.totalSalesRevenue)}
                        subtext={`${analytics?.totalVehiclesSold ?? 0} vehicles sold`}
                    />
                </div>

                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <h2 className="text-lg font-bold text-slate-900 m-0">
                                Fleet Status Distribution
                            </h2>

                            {analyticsError && (
                                <Button
                                    id="analytics-retry-button"
                                    variant="outline"
                                    size="sm"
                                    onClick={retryAnalytics}
                                >
                                    Retry
                                </Button>
                            )}
                        </div>

                        {analyticsError ? (
                            <p id="analytics-error-message" className="text-sm text-red-600">
                                {analyticsError}
                            </p>
                        ) : (
                            <FleetStatusPieChart data={analytics?.statusDistribution || []} />
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="border-slate-200 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5">Fuel Type Breakdown</h2>
                            <FuelTypeBreakdown data={analytics?.fuelTypeDistribution || []} />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5">Body Type Distribution</h2>
                            <BodyTypeBreakdown data={analytics?.bodyTypeDistribution || []} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="border-slate-200 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5">Top Brands</h2>
                            <DistributionBars data={analytics?.brandDistribution || []} labelKey="brand" />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5">Transmission Mix</h2>
                            <DistributionBars data={analytics?.transmissionDistribution || []} labelKey="transmission" />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5">Registration Cities</h2>
                            <DistributionBars data={analytics?.registrationCityDistribution || []} labelKey="city" />
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-0">
                        <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900 m-0">
                                All Vehicles
                            </h2>
                        </div>

                        {cars.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-slate-500">No vehicles in Catalogue.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Vehicle</th>
                                            <th className="px-6 py-4 font-semibold">Year</th>
                                            <th className="px-6 py-4 font-semibold">Price</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody id="dashboard-car-list" className="divide-y divide-slate-100">
                                        {cars.map(car => (
                                            <tr
                                                id={`car-row-${car._id}`}
                                                key={car._id}
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-bold text-slate-900">
                                                    {car.brand} {car.name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">
                                                    {car.model_year}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">
                                                    ${car.price_per_day?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={car.availability_status === 'Available' ? 'available' : 'unavailable'}>
                                                        {car.availability_status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 flex justify-end gap-3">
                                                    <Button
                                                        id={`car-row-${car._id}-edit`}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/edit-car/${car._id}`)}
                                                        className="h-8 px-3 text-xs"
                                                    >
                                                        Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
