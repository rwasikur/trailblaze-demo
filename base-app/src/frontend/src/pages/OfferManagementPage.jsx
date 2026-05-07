import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, CarFront, CheckCircle2, Clock3, Edit3, Gift, PauseCircle, Percent, Plus, Save, Sparkles, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';
import { Button } from '../components/ui/Button';

const emptyForm = {
    title: '',
    badge_text: '',
    car_id: '',
    discount_percent: '',
    activation_date: '',
    expiry_date: '',
    is_enabled: true,
};

const statusStyles = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Scheduled: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Expired: 'bg-slate-100 text-slate-500 border-slate-200',
    Paused: 'bg-amber-50 text-amber-700 border-amber-200',
};

const offerBannerStyles = [
    'from-slate-950 via-slate-900 to-blue-950 text-white',
    'from-blue-950 via-slate-900 to-cyan-900 text-white',
    'from-slate-900 via-zinc-900 to-slate-700 text-white',
    'from-cyan-950 via-slate-900 to-blue-900 text-white',
    'from-indigo-950 via-slate-900 to-slate-800 text-white',
];

const getOfferBannerStyle = (offer) => {
    const seed = `${offer.badge_text || ''}${offer.title || ''}${offer._id || ''}`;
    const hash = [...seed].reduce((total, character) => total + character.charCodeAt(0), 0);
    return offerBannerStyles[hash % offerBannerStyles.length];
};

const toInputDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const formatScheduleDate = (value) => {
    if (!value) return { date: 'Not set', time: '' };
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return { date: 'Not set', time: '' };

    return {
        date: parsedDate.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }),
        time: parsedDate.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
        }),
    };
};

const ScheduleDate = ({ value }) => {
    const { date, time } = formatScheduleDate(value);

    return (
        <div className="mt-1 font-bold leading-tight text-slate-900">
            <div>{date}</div>
            {time && <div className="mt-1 text-xs font-black text-slate-500">{time}</div>}
        </div>
    );
};

const OfferManagementPage = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [cars, setCars] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState('All');

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) {
            navigate('/admin');
            return;
        }
        fetchPageData();
    }, [navigate, token]);

    const getOfferCarId = (offer) => {
        return offer.car_id || offer.car?._id || offer.car?.id || '';
    };

    const fetchPageData = async () => {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const [offersResult, carsResult] = await Promise.allSettled([
            api.get('/api/offers/admin/all', { headers }),
            api.get('/api/cars/admin/all', { headers }),
        ]);

        if (offersResult.status === 'fulfilled') {
            setOffers(offersResult.value.data || []);
        } else {
            console.error('Failed to fetch offers:', offersResult.reason);
            toast.error('Failed to load offers');
        }

        if (carsResult.status === 'fulfilled') {
            setCars(carsResult.value.data || []);
        } else {
            console.error('Failed to fetch vehicles:', carsResult.reason);
            toast.error('Failed to load vehicles for offer selection');
        }

        setLoading(false);
    };

    const fetchOffers = async () => {
        try {
            const { data } = await api.get('/api/offers/admin/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOffers(data || []);
        } catch (error) {
            console.error('Failed to fetch offers:', error);
            toast.error('Failed to refresh offers');
        }
    };

    const filteredOffers = useMemo(() => {
        if (filter === 'All') return offers;
        return offers.filter((offer) => offer.status === filter);
    }, [filter, offers]);

    const metrics = useMemo(() => {
        return offers.reduce((acc, offer) => {
            acc[offer.status] = (acc[offer.status] || 0) + 1;
            return acc;
        }, { Active: 0, Scheduled: 0, Expired: 0, Paused: 0 });
    }, [offers]);

    const selectedCar = useMemo(() => {
        return cars.find((car) => String(car._id) === String(form.car_id)) || null;
    }, [cars, form.car_id]);

    const calculatedSavings = useMemo(() => {
        const percent = Number(form.discount_percent);
        if (!selectedCar || !Number.isFinite(percent) || percent <= 0) return 0;
        return Math.round((Number(selectedCar.price) || 0) * (percent / 100));
    }, [selectedCar, form.discount_percent]);

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const startEditing = (offer) => {
        setEditingId(offer._id);
        setForm({
            title: offer.title || '',
            badge_text: offer.badge_text || '',
            car_id: getOfferCarId(offer),
            discount_percent: offer.discount_percent ?? '',
            activation_date: toInputDate(offer.activation_date),
            expiry_date: toInputDate(offer.expiry_date),
            is_enabled: Boolean(offer.is_enabled),
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submitOffer = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                car_id: String(form.car_id || ''),
                discount_percent: Number(form.discount_percent),
                description: '',
                activation_date: new Date(form.activation_date).toISOString(),
                expiry_date: new Date(form.expiry_date).toISOString(),
            };

            if (editingId) {
                await api.put(`/api/offers/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Offer updated');
            } else {
                await api.post('/api/offers', payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Offer scheduled');
            }

            resetForm();
            fetchOffers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save offer');
        } finally {
            setSaving(false);
        }
    };

    const toggleOffer = async (offer) => {
        try {
            await api.put(`/api/offers/${offer._id}`, { is_enabled: !offer.is_enabled }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchOffers();
        } catch (error) {
            toast.error('Failed to update offer status');
        }
    };

    const deleteOffer = async (offerId) => {
        try {
            await api.delete(`/api/offers/${offerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Offer removed');
            if (editingId === offerId) resetForm();
            fetchOffers();
        } catch (error) {
            toast.error('Failed to delete offer');
        }
    };

    return (
        <div className="min-h-full bg-[#f5f7fb] text-slate-900">
            <section className="border-b border-slate-200 bg-slate-950 text-white">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_420px] lg:items-end">
                    <div className="space-y-6">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 transition-colors hover:text-white"
                        >
                            Back to dashboard
                        </button>
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">
                                <Sparkles className="h-3.5 w-3.5" />
                                Campaign Studio
                            </div>
                            <h1 id="offers-heading" className="max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
                                Offer Management
                            </h1>
                            <p className="max-w-2xl text-sm font-medium leading-6 text-slate-300">
                                Schedule promotional periods for individual vehicles. Active campaigns calculate the savings label from the selected car price and discount percent.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Active', value: metrics.Active, icon: CheckCircle2, tone: 'text-emerald-300' },
                            { label: 'Scheduled', value: metrics.Scheduled, icon: Clock3, tone: 'text-cyan-300' },
                            { label: 'Paused', value: metrics.Paused, icon: PauseCircle, tone: 'text-amber-300' },
                            { label: 'Expired', value: metrics.Expired, icon: CalendarClock, tone: 'text-slate-300' },
                        ].map((item) => (
                            <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-white/10 ${item.tone}`}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <div className="text-2xl font-black">{item.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-[90rem] gap-6 px-6 py-8 lg:grid-cols-[380px_minmax(0,1fr)]">
                <form id="offer-form" onSubmit={submitOffer} className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black tracking-tight">{editingId ? 'Edit Offer' : 'Create Offer'}</h2>
                            <p className="text-xs font-semibold text-slate-500">Choose a vehicle, discount, badge, and schedule window.</p>
                        </div>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" aria-label="Cancel editing">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Campaign Name</span>
                            <input
                                id="offer-title-input"
                                required
                                value={form.title}
                                onChange={(event) => updateField('title', event.target.value)}
                                placeholder="One Year Anniversary"
                                className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none transition focus:border-slate-900"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Badge</span>
                            <input
                                id="offer-badge-input"
                                required
                                maxLength={24}
                                value={form.badge_text}
                                onChange={(event) => updateField('badge_text', event.target.value)}
                                placeholder="Anniversary"
                                className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none transition focus:border-slate-900"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Vehicle</span>
                            <select
                                id="offer-car-select"
                                required
                                value={form.car_id}
                                onChange={(event) => updateField('car_id', event.target.value)}
                                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold outline-none transition focus:border-slate-900"
                            >
                                <option value="">{cars.length === 0 ? 'No vehicles loaded' : 'Select a vehicle'}</option>
                                {cars.map((car) => (
                                    <option key={car._id} value={car._id}>
                                        {car.brand} {car.name} - ${car.price?.toLocaleString()} - {car.condition === 'Used' ? 'Pre-Owned' : car.condition}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="grid grid-cols-[1fr_auto] gap-3">
                            <label className="block">
                                <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Discount Percent</span>
                                <div className="relative">
                                    <input
                                        id="offer-discount-percent-input"
                                        required
                                        type="number"
                                        min="0"
                                        max="95"
                                        step="0.1"
                                        value={form.discount_percent}
                                        onChange={(event) => updateField('discount_percent', event.target.value)}
                                        placeholder="7.5"
                                        className="h-11 w-full rounded-md border border-slate-200 px-3 pr-10 text-sm font-semibold outline-none transition focus:border-slate-900"
                                    />
                                    <Percent className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>
                            </label>
                            <div id="offer-savings-preview" className="flex min-w-[132px] flex-col justify-center rounded-md border border-emerald-100 bg-emerald-50 px-3">
                                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">Calculated</span>
                                <span className="text-sm font-black text-emerald-800">
                                    {calculatedSavings > 0 ? `Save $${calculatedSavings.toLocaleString()}` : 'Save $0'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Activation</span>
                                <input
                                    id="offer-activation-input"
                                    required
                                    type="datetime-local"
                                    value={form.activation_date}
                                    onChange={(event) => updateField('activation_date', event.target.value)}
                                className="h-11 w-full rounded-md border border-slate-200 px-3 text-xs font-bold outline-none transition focus:border-slate-900"
                                />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Expiry</span>
                                <input
                                    id="offer-expiry-input"
                                    required
                                    type="datetime-local"
                                    value={form.expiry_date}
                                    onChange={(event) => updateField('expiry_date', event.target.value)}
                                    className="h-11 w-full rounded-md border border-slate-200 px-3 text-xs font-bold outline-none transition focus:border-slate-900"
                                />
                            </label>
                        </div>

                        <label className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
                            <span>
                                <span className="block text-xs font-black text-slate-900">Enabled</span>
                                <span className="block text-[11px] font-semibold text-slate-500">Disabled offers never appear publicly.</span>
                            </span>
                            <input
                                id="offer-enabled-toggle"
                                type="checkbox"
                                checked={form.is_enabled}
                                onChange={(event) => updateField('is_enabled', event.target.checked)}
                                className="h-5 w-5 accent-slate-900"
                            />
                        </label>

                        <Button id="offer-submit-button" type="submit" disabled={saving} variant="slate" className="h-12 w-full gap-2 rounded-md text-xs font-black uppercase tracking-[0.2em]">
                            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {saving ? 'Saving...' : editingId ? 'Save Offer' : 'Schedule Offer'}
                        </Button>
                    </div>
                </form>

                <section className="space-y-5">
                    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-black tracking-tight">Campaign Timeline</h2>
                            <p className="text-xs font-semibold text-slate-500">Badges appear only when the current date falls inside the configured period.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'Active', 'Scheduled', 'Paused', 'Expired'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`rounded-md px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${filter === status ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="rounded-lg border border-slate-200 bg-white py-24 text-center text-sm font-bold text-slate-400 shadow-sm">
                            Loading offer schedule...
                        </div>
                    ) : filteredOffers.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-white py-24 text-center shadow-sm">
                            <Gift className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                            <h3 className="text-xl font-black text-slate-900">No offers in this view</h3>
                            <p className="mt-2 text-sm font-medium text-slate-500">Create a scheduled campaign to start publishing vehicle badges.</p>
                        </div>
                    ) : (
                        <div id="offer-list" className="grid gap-4">
                            {filteredOffers.map((offer) => (
                                <article key={offer._id} id={`offer-row-${offer._id}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                    <div className={`bg-gradient-to-r ${getOfferBannerStyle(offer)} px-5 py-4`}>
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur">
                                                        <Gift className="h-3 w-3" />
                                                        {offer.badge_text}
                                                    </span>
                                                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${statusStyles[offer.status] || statusStyles.Expired}`}>
                                                        {offer.status}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-black tracking-tight">{offer.title}</h3>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Offer</div>
                                                <div className="text-lg font-black">{offer.discount_label || 'Badge only'}</div>
                                                <div className="text-xs font-bold opacity-75">{Number(offer.discount_percent || 0).toLocaleString()}% off</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                                        <div className="grid gap-3 text-sm md:grid-cols-3">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activation</div>
                                                <ScheduleDate value={offer.activation_date} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Expiry</div>
                                                <ScheduleDate value={offer.expiry_date} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vehicle</div>
                                                <div className="mt-1 flex items-center gap-2 font-bold text-slate-900">
                                                    <CarFront className="h-4 w-4 text-slate-400" />
                                                    <span>{offer.car ? `${offer.car.brand} ${offer.car.name}` : 'Vehicle unavailable'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                                            <button id={`offer-row-${offer._id}-toggle`} onClick={() => toggleOffer(offer)} className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 hover:border-slate-900 hover:text-slate-900">
                                                <PauseCircle className="h-3.5 w-3.5" />
                                                {offer.is_enabled ? 'Pause' : 'Enable'}
                                            </button>
                                            <button id={`offer-row-${offer._id}-edit`} onClick={() => startEditing(offer)} className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 hover:border-slate-900 hover:text-slate-900">
                                                <Edit3 className="h-3.5 w-3.5" />
                                                Edit
                                            </button>
                                            <button id={`offer-row-${offer._id}-delete`} onClick={() => deleteOffer(offer._id)} className="inline-flex h-9 items-center gap-2 rounded-md border border-red-100 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default OfferManagementPage;
