'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';

// Swedish Tax Deadlines 2025
const DEADLINES_2025 = [
    {
        id: '1',
        date: '2025-01-17',
        title: 'Arbetsgivardeklaration',
        description: 'Employer declaration for December 2024',
        category: 'employer',
        recurring: true
    },
    {
        id: '2',
        date: '2025-02-12',
        title: 'MOMS Monthly',
        description: 'VAT declaration for January (monthly reporters)',
        category: 'vat',
        recurring: true
    },
    {
        id: '3',
        date: '2025-02-26',
        title: 'MOMS Quarterly',
        description: 'VAT declaration Q4 2024 (quarterly reporters)',
        category: 'vat',
        recurring: false
    },
    {
        id: '4',
        date: '2025-03-31',
        title: 'Årsredovisning (Small Companies)',
        description: 'Annual report submission deadline for smaller companies',
        category: 'annual',
        recurring: false
    },
    {
        id: '5',
        date: '2025-05-02',
        title: 'Inkomstdeklaration (Private)',
        description: 'Personal income tax declaration deadline',
        category: 'personal',
        recurring: false
    },
    {
        id: '6',
        date: '2025-05-05',
        title: 'Inkomstdeklaration (Company)',
        description: 'Corporate income tax declaration (standard deadline)',
        category: 'corporate',
        recurring: false
    },
    {
        id: '7',
        date: '2025-06-30',
        title: 'Årsredovisning (AB)',
        description: 'Annual report for limited companies (within 7 months)',
        category: 'annual',
        recurring: false
    },
    {
        id: '8',
        date: '2025-08-12',
        title: 'MOMS Half-Year',
        description: 'VAT declaration H1 2025 (bi-annual reporters)',
        category: 'vat',
        recurring: false
    },
    {
        id: '9',
        date: '2025-12-27',
        title: 'Preliminary Tax Payment',
        description: 'Final preliminary tax payment for 2025',
        category: 'tax',
        recurring: false
    }
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    employer: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    vat: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    annual: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    personal: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    corporate: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    tax: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
};

export default function DeadlinesPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<string>('all');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredDeadlines = DEADLINES_2025
        .filter(d => filter === 'all' || d.category === filter)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const getStatus = (dateStr: string) => {
        const date = new Date(dateStr);
        const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'passed';
        if (diffDays <= 14) return 'urgent';
        if (diffDays <= 30) return 'upcoming';
        return 'future';
    };

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).format(new Date(dateStr));
    };

    const getDaysUntil = (dateStr: string) => {
        const date = new Date(dateStr);
        const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        if (diffDays === 0) return 'Today!';
        if (diffDays === 1) return 'Tomorrow';
        return `${diffDays} days`;
    };

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'vat', label: 'VAT/MOMS' },
        { id: 'employer', label: 'Employer' },
        { id: 'annual', label: 'Annual' },
        { id: 'personal', label: 'Personal' },
        { id: 'corporate', label: 'Corporate' },
    ];

    return (
        <div className="h-full overflow-y-auto bg-[#050505] text-white">
            {/* Background Effects */}
            <div className="fixed top-[-20%] left-[10%] w-[600px] h-[600px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[30%] w-[500px] h-[500px] bg-rose-900/8 rounded-full blur-[100px] pointer-events-none" />

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
                                <Calendar className="text-amber-400" size={28} />
                                Tax Deadlines
                            </h1>
                            <p className="text-sm text-zinc-400 mt-1">
                                Swedish tax calendar 2025
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={`
                                px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                                ${filter === cat.id
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10'
                                }
                            `}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Upcoming Alert */}
                {filteredDeadlines.some(d => getStatus(d.date) === 'urgent') && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-center gap-3"
                    >
                        <AlertCircle className="text-amber-400 shrink-0" size={20} />
                        <p className="text-sm text-amber-200">
                            You have deadlines coming up within the next 2 weeks!
                        </p>
                    </motion.div>
                )}

                {/* Deadlines List */}
                <div className="space-y-3">
                    {filteredDeadlines.map((deadline, index) => {
                        const status = getStatus(deadline.date);
                        const colors = CATEGORY_COLORS[deadline.category];
                        const isPassed = status === 'passed';

                        return (
                            <motion.div
                                key={deadline.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`
                                    group bg-[#0F0F10] border rounded-xl p-4 md:p-5 transition-all
                                    ${isPassed
                                        ? 'border-white/5 opacity-50'
                                        : status === 'urgent'
                                            ? 'border-amber-500/30 hover:border-amber-500/50'
                                            : 'border-white/5 hover:border-white/10'
                                    }
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Date Badge */}
                                    <div className={`
                                        shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center
                                        ${isPassed ? 'bg-white/5' : colors.bg}
                                    `}>
                                        <span className={`text-xs font-medium ${isPassed ? 'text-zinc-500' : colors.text}`}>
                                            {new Date(deadline.date).toLocaleDateString('en-US', { month: 'short' })}
                                        </span>
                                        <span className={`text-lg font-bold ${isPassed ? 'text-zinc-400' : 'text-white'}`}>
                                            {new Date(deadline.date).getDate()}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-semibold ${isPassed ? 'text-zinc-400' : 'text-white'}`}>
                                                {deadline.title}
                                            </h3>
                                            {deadline.recurring && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/10 text-zinc-400 rounded">
                                                    Monthly
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-500 mb-2">
                                            {deadline.description}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className={`flex items-center gap-1 ${isPassed ? 'text-zinc-600' :
                                                    status === 'urgent' ? 'text-amber-400' :
                                                        'text-zinc-500'
                                                }`}>
                                                <Clock size={12} />
                                                {getDaysUntil(deadline.date)}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text} ${colors.border} border`}>
                                                {deadline.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Icon */}
                                    {isPassed && (
                                        <CheckCircle2 className="text-zinc-600 shrink-0" size={20} />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Note */}
                <p className="text-xs text-zinc-600 text-center mt-8">
                    Dates are based on Skatteverket's official calendar. Always verify with official sources.
                </p>
            </main>
        </div>
    );
}
