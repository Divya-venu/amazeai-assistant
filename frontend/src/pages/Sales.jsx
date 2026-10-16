import React, { useEffect, useState } from 'react';
import { ShoppingCart, RefreshCw, Loader2 } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchSales = async () => {
        try {
            setError('');

            const response = await axios.get(
                'http://localhost:5000/api/sales'
            );

            setSales(response.data.sales || []);
        } catch (err) {
            console.error('Error fetching sales:', err);
            setError('Unable to load sales data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSales();

        // Listen for real-time sales updates
        const socket = io('http://localhost:5000', {
            withCredentials: true
        });

        socket.on('salesUpdated', () => {
            console.log('[Sales] Real-time update received');
            fetchSales();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchSales();
    };

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString('en-IN')}`;
    };

    const totalRevenue = sales.reduce(
        (total, sale) =>
            total + Number(sale.price || 0) * Number(sale.quantity || 0),
        0
    );

    const totalProfit = sales.reduce(
        (total, sale) =>
            total +
            (Number(sale.profit) ||
                (Number(sale.price || 0) -
                    Number(sale.costPrice || 0)) *
                    Number(sale.quantity || 0)),
        0
    );

    const totalQuantity = sales.reduce(
        (total, sale) => total + Number(sale.quantity || 0),
        0
    );

    if (loading) {
        return (
            <div className="flex min-h-100 items-center justify-center text-white">
                <Loader2 className="mr-3 h-8 w-8 animate-spin text-indigo-400" />
                Loading sales...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white">
                        Sales Records
                    </h1>

                    <p className="mt-2 text-sm text-gray-400">
                        View and monitor all your business sales
                    </p>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${
                            refreshing ? 'animate-spin' : ''
                        }`}
                    />
                    Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="glass-card rounded-4xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Total Sales
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-white">
                                {sales.length}
                            </h2>
                        </div>

                        <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-400">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">
                        Number of sales records
                    </p>
                </div>

                <div className="glass-card rounded-4xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Total Revenue
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-white">
                                {formatCurrency(totalRevenue)}
                            </h2>
                        </div>

                        <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
                            ₹
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">
                        Revenue generated from sales
                    </p>
                </div>

                <div className="glass-card rounded-4xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Total Profit
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-white">
                                {formatCurrency(totalProfit)}
                            </h2>
                        </div>

                        <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-400">
                            ₹
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">
                        Profit after product costs
                    </p>
                </div>
            </div>

            {/* Sales Table Card */}
            <div className="glass-card overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            All Sales
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                            {totalQuantity} total items sold
                        </p>
                    </div>

                    <div className="rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-gray-400">
                        Live Data
                    </div>
                </div>

                {error && (
                    <div className="p-6 text-red-400">
                        {error}
                    </div>
                )}

                {!error && sales.length === 0 && (
                    <div className="p-10 text-center text-gray-400">
                        No sales records found.
                    </div>
                )}

                {!error && sales.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-275 text-left text-sm">
                            <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Cost</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Profit</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {sales.map((sale) => {
                                    const calculatedProfit =
                                        Number(sale.profit) ||
                                        (Number(sale.price || 0) -
                                            Number(sale.costPrice || 0)) *
                                            Number(sale.quantity || 0);

                                    return (
                                        <tr
                                            key={sale._id}
                                            className="border-t border-white/10 transition hover:bg-white/5"
                                        >
                                            <td className="px-6 py-4 font-semibold text-white">
                                                {sale.productName}
                                            </td>

                                            <td className="px-6 py-4 text-gray-300">
                                                {sale.category}
                                            </td>

                                            <td className="px-6 py-4 text-gray-300">
                                                {sale.customerName}
                                            </td>

                                            <td className="px-6 py-4 text-gray-300">
                                                {formatCurrency(sale.price)}
                                            </td>

                                            <td className="px-6 py-4 text-gray-400">
                                                {formatCurrency(sale.costPrice)}
                                            </td>

                                            <td className="px-6 py-4 text-gray-300">
                                                {sale.quantity}
                                            </td>

                                            <td className="px-6 py-4 font-bold text-emerald-400">
                                                {formatCurrency(
                                                    calculatedProfit
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-gray-300">
                                                {sale.paymentMethod}
                                            </td>

                                            <td className="px-6 py-4 text-gray-400">
                                                {sale.date
                                                    ? new Date(
                                                          sale.date
                                                      ).toLocaleDateString(
                                                          'en-IN'
                                                      )
                                                    : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sales;