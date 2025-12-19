'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    FileBarChart,
    Download,
    FileSpreadsheet,
    PieChart,
    TrendingUp,
    Lock
} from 'lucide-react';
import { Orb } from '@/components/Orb';

const REPORT_TYPES = [
    {
        id: 'expense',
        title: 'Expense Report',
        description: 'Track and categorize your business expenses',
        icon: FileSpreadsheet,
        color: 'emerald',
        available: false
    },
    {
        id: 'vat',
        title: 'VAT Summary',
        description: 'MOMS summary for your tax declarations',
        icon: PieChart,
        color: 'blue',
        available: false
    },
    {
        id: 'income',
        title: 'Income Statement',
        description: 'Revenue and profit analysis',
        icon: TrendingUp,
        color: 'purple',
        available: false
    },
    {
        id: 'annual',
        title: 'Annual Summary',
        description: 'Year-end financial overview',
        icon: FileBarChart,
        color: 'amber',
        available: false
    }
];

export default function ReportsPage() {
    const router = useRouter();

    return (
        <div className="h-full overflow-y-auto bg-[#050505] text-white">
            {/* Background Effects */}
            <div className="fixed top-[-20%] right-[20%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-900/8 rounded-full blur-[100px] pointer-events-none" />

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
                                <FileBarChart className="text-purple-400" size={28} />
                                Reports
                            </h1>
                            <p className="text-sm text-zinc-400 mt-1">
                                Financial reports and exports
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                {/* Coming Soon Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-br from-[#0F0F10] to-[#141414] border border-white/10 rounded-2xl p-8 mb-8 overflow-hidden"
                >
                    {/* Orb Background */}
                    <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-60 scale-75 pointer-events-none hidden md:block">
                        <Orb className="w-32 h-32" />
                    </div>

                    <div className="relative z-10 max-w-md">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 text-xs font-semibold bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                                Coming Soon
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Reports Feature</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            We're building powerful reporting tools to help you generate professional financial reports,
                            track expenses, and prepare for tax declarations — all from your uploaded documents.
                        </p>
                    </div>
                </motion.div>

                {/* Report Types Grid */}
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                    Planned Reports
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REPORT_TYPES.map((report, index) => {
                        const colorClasses: Record<string, string> = {
                            emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                            blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                            purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                            amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        };

                        return (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-[#0F0F10] border border-white/5 rounded-xl p-5 hover:bg-[#141414] transition-all relative overflow-hidden"
                            >
                                {/* Lock Overlay */}
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Lock size={16} />
                                        <span className="text-sm font-medium">Coming Soon</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClasses[report.color]}`}>
                                        <report.icon size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-1">{report.title}</h4>
                                        <p className="text-sm text-zinc-500">{report.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Info Note */}
                <div className="mt-8 bg-[#0F0F10] border border-white/5 rounded-xl p-4 flex items-start gap-3">
                    <Download className="text-zinc-500 shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-sm text-zinc-300 font-medium mb-1">Export Formats</p>
                        <p className="text-xs text-zinc-500">
                            Reports will be available in PDF, Excel, and CSV formats for easy integration with your accounting software.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
