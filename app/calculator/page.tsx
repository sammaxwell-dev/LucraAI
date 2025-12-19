'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calculator as CalculatorIcon,
    Percent,
    DollarSign,
    Users,
    ChevronDown
} from 'lucide-react';

// Swedish VAT rates
const VAT_RATES = [
    { rate: 25, label: '25%', description: 'Standard rate (most goods & services)' },
    { rate: 12, label: '12%', description: 'Food, hotels, restaurants' },
    { rate: 6, label: '6%', description: 'Books, newspapers, cultural events' },
];

// Employer contribution rate 2024
const EMPLOYER_CONTRIBUTION_RATE = 0.3142;

export default function CalculatorPage() {
    const router = useRouter();
    const [activeCalc, setActiveCalc] = useState<'vat' | 'employer' | 'salary'>('vat');

    // VAT Calculator State
    const [vatAmount, setVatAmount] = useState('');
    const [vatRate, setVatRate] = useState(25);
    const [vatDirection, setVatDirection] = useState<'add' | 'extract'>('add');

    // Employer Contribution State
    const [grossSalary, setGrossSalary] = useState('');

    // Salary Calculator State
    const [monthlyGross, setMonthlyGross] = useState('');
    const [taxRate, setTaxRate] = useState('30');

    // VAT Calculations
    const calculateVat = () => {
        const amount = parseFloat(vatAmount) || 0;
        if (vatDirection === 'add') {
            const vat = amount * (vatRate / 100);
            return { net: amount, vat, total: amount + vat };
        } else {
            const net = amount / (1 + vatRate / 100);
            const vat = amount - net;
            return { net, vat, total: amount };
        }
    };

    // Employer Contribution Calculation
    const calculateEmployerCost = () => {
        const salary = parseFloat(grossSalary) || 0;
        const contribution = salary * EMPLOYER_CONTRIBUTION_RATE;
        return { salary, contribution, total: salary + contribution };
    };

    // Net Salary Calculation
    const calculateNetSalary = () => {
        const gross = parseFloat(monthlyGross) || 0;
        const rate = parseFloat(taxRate) || 30;
        const tax = gross * (rate / 100);
        return { gross, tax, net: gross - tax };
    };

    const vatResult = calculateVat();
    const employerResult = calculateEmployerCost();
    const salaryResult = calculateNetSalary();

    const formatSEK = (num: number) => {
        return new Intl.NumberFormat('sv-SE', {
            style: 'currency',
            currency: 'SEK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(num);
    };

    const calculators = [
        { id: 'vat', icon: Percent, label: 'VAT / MOMS' },
        { id: 'employer', icon: Users, label: 'Employer Cost' },
        { id: 'salary', icon: DollarSign, label: 'Net Salary' },
    ] as const;

    return (
        <div className="h-full overflow-y-auto bg-[#050505] text-white">
            {/* Background Effects */}
            <div className="fixed top-[-20%] left-[20%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-900/8 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/80 border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 md:py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                                <CalculatorIcon className="text-emerald-400" size={28} />
                                Calculator
                            </h1>
                            <p className="text-sm text-zinc-400 mt-1">
                                Swedish tax and accounting calculators
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                {/* Calculator Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {calculators.map((calc) => (
                        <button
                            key={calc.id}
                            onClick={() => setActiveCalc(calc.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                                ${activeCalc === calc.id
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-zinc-300'
                                }
                            `}
                        >
                            <calc.icon size={16} />
                            {calc.label}
                        </button>
                    ))}
                </div>

                {/* VAT Calculator */}
                {activeCalc === 'vat' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-[#0F0F10] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-6">VAT / MOMS Calculator</h2>

                            {/* Direction Toggle */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setVatDirection('add')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${vatDirection === 'add'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-white/5 text-zinc-400 border border-white/10'
                                        }`}
                                >
                                    Add VAT
                                </button>
                                <button
                                    onClick={() => setVatDirection('extract')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${vatDirection === 'extract'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-white/5 text-zinc-400 border border-white/10'
                                        }`}
                                >
                                    Extract VAT
                                </button>
                            </div>

                            {/* Amount Input */}
                            <div className="mb-4">
                                <label className="block text-sm text-zinc-400 mb-2">
                                    {vatDirection === 'add' ? 'Amount (excl. VAT)' : 'Amount (incl. VAT)'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={vatAmount}
                                        onChange={(e) => setVatAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 pr-16 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">SEK</span>
                                </div>
                            </div>

                            {/* VAT Rate Select */}
                            <div className="mb-6">
                                <label className="block text-sm text-zinc-400 mb-2">VAT Rate</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {VAT_RATES.map((rate) => (
                                        <button
                                            key={rate.rate}
                                            onClick={() => setVatRate(rate.rate)}
                                            className={`py-3 rounded-xl text-sm font-medium transition-all ${vatRate === rate.rate
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            {rate.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">
                                    {VAT_RATES.find(r => r.rate === vatRate)?.description}
                                </p>
                            </div>

                            {/* Results */}
                            <div className="bg-[#141414] rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">Net Amount</span>
                                    <span className="font-medium">{formatSEK(vatResult.net)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">VAT ({vatRate}%)</span>
                                    <span className="font-medium text-emerald-400">{formatSEK(vatResult.vat)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                    <span className="font-semibold">Total</span>
                                    <span className="text-lg font-bold">{formatSEK(vatResult.total)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Employer Cost Calculator */}
                {activeCalc === 'employer' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-[#0F0F10] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-2">Employer Cost Calculator</h2>
                            <p className="text-sm text-zinc-500 mb-6">
                                Calculate arbetsgivaravgift (employer social contributions)
                            </p>

                            {/* Salary Input */}
                            <div className="mb-6">
                                <label className="block text-sm text-zinc-400 mb-2">
                                    Gross Monthly Salary
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={grossSalary}
                                        onChange={(e) => setGrossSalary(e.target.value)}
                                        placeholder="Enter gross salary"
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 pr-16 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">SEK</span>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                                <p className="text-sm text-blue-300">
                                    <strong>Arbetsgivaravgift 2024:</strong> 31.42% of gross salary
                                </p>
                            </div>

                            {/* Results */}
                            <div className="bg-[#141414] rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">Gross Salary</span>
                                    <span className="font-medium">{formatSEK(employerResult.salary)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">Employer Contribution</span>
                                    <span className="font-medium text-blue-400">{formatSEK(employerResult.contribution)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                    <span className="font-semibold">Total Employer Cost</span>
                                    <span className="text-lg font-bold">{formatSEK(employerResult.total)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Net Salary Calculator */}
                {activeCalc === 'salary' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-[#0F0F10] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-2">Net Salary Calculator</h2>
                            <p className="text-sm text-zinc-500 mb-6">
                                Estimate your take-home pay after taxes
                            </p>

                            {/* Gross Salary Input */}
                            <div className="mb-4">
                                <label className="block text-sm text-zinc-400 mb-2">
                                    Gross Monthly Salary
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={monthlyGross}
                                        onChange={(e) => setMonthlyGross(e.target.value)}
                                        placeholder="Enter gross salary"
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 pr-16 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">SEK</span>
                                </div>
                            </div>

                            {/* Tax Rate Input */}
                            <div className="mb-6">
                                <label className="block text-sm text-zinc-400 mb-2">
                                    Municipal Tax Rate (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(e.target.value)}
                                        placeholder="30"
                                        min="25"
                                        max="35"
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">%</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">
                                    Swedish municipal tax rates range from ~29% to ~35%
                                </p>
                            </div>

                            {/* Results */}
                            <div className="bg-[#141414] rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">Gross Salary</span>
                                    <span className="font-medium">{formatSEK(salaryResult.gross)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">Income Tax ({taxRate}%)</span>
                                    <span className="font-medium text-red-400">-{formatSEK(salaryResult.tax)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                    <span className="font-semibold">Net Salary</span>
                                    <span className="text-lg font-bold text-purple-400">{formatSEK(salaryResult.net)}</span>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <p className="text-xs text-zinc-600 mt-4">
                                * This is a simplified estimate. Actual taxes may vary based on deductions, state tax thresholds, and other factors.
                            </p>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
