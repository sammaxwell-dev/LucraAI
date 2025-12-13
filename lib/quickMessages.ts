import { QuickMessage } from '@/types';

// 20 полезных быстрых сообщений на тему налогов и бухгалтерии
export const QUICK_MESSAGES: QuickMessage[] = [
    {
        title: "Travel Deductions",
        description: "Check if you are eligible for travel deductions",
        fullMessage: "Can you help me understand what travel deductions (Reseavdrag) I'm eligible for? Please explain the conditions and how to calculate them."
    },
    {
        title: "VAT Returns",
        description: "Learn about VAT declaration process",
        fullMessage: "Please explain in detail about VAT (moms) declarations in Sweden. When should I file and what should I include?"
    },
    {
        title: "Income Declaration",
        description: "Help with annual income tax declaration",
        fullMessage: "Can you help me understand the annual income tax declaration (inkomstdeklaration)? What do I need to report and what are the deadlines?"
    },
    {
        title: "Employer Contributions",
        description: "Understanding Swedish employer obligations",
        fullMessage: "Please explain employer contributions (arbetsgivaravgifter) in Sweden. What are the rates and when should I pay?"
    },
    {
        title: "Home Office Deduction",
        description: "Deductions for working from home",
        fullMessage: "What tax deductions can I claim for working from home (hemmakontorsavdrag)? Which expenses can be included?"
    },
    {
        title: "Corporate Tax Rate",
        description: "Current Swedish corporate tax rates",
        fullMessage: "What is the current corporate tax rate in Sweden and are there any special considerations for small businesses?"
    },
    {
        title: "Dividend Taxation",
        description: "Tax rules for dividend income",
        fullMessage: "Can you explain dividend taxation in Sweden? What rates apply and are there any exemptions?"
    },
    {
        title: "K2 vs K3 Standards",
        description: "Differences between accounting standards",
        fullMessage: "What's the difference between K2 and K3 accounting standards? Which one should I choose for my company?"
    },
    {
        title: "Start a Company",
        description: "Tax implications of starting a business",
        fullMessage: "What tax aspects should I consider when registering a company in Sweden? What's important to know at the start?"
    },
    {
        title: "Preliminary Tax",
        description: "Understanding preliminary tax payments",
        fullMessage: "Please explain preliminary tax (preliminärskatt). How do I calculate it correctly and when should I pay?"
    },
    {
        title: "Expense Reports",
        description: "Proper expense documentation",
        fullMessage: "How should I properly prepare expense reports (utläggsrapporter) for tax purposes? What documents are needed?"
    },
    {
        title: "Tax Account Overview",
        description: "How Swedish tax account works",
        fullMessage: "Can you explain how the tax account (skattekonto) works in Sweden? How do I manage it?"
    },
    {
        title: "Capital Gains Tax",
        description: "Tax on investment profits",
        fullMessage: "What is the capital gains tax (kapitalvinstskatt) when selling assets? Please explain any exemptions."
    },
    {
        title: "Payroll Taxes",
        description: "Understanding payroll tax obligations",
        fullMessage: "What payroll taxes (löneskatt) must an employer pay in Sweden?"
    },
    {
        title: "Tax Deduction Card",
        description: "How to use your tax deduction card",
        fullMessage: "How does the tax deduction card (skattsedel) work and how should I use it correctly?"
    },
    {
        title: "Business Travel",
        description: "Tax rules for business trips",
        fullMessage: "What are the tax rules for business travel expenses (tjänsteresa) in Sweden? What can be deducted?"
    },
    {
        title: "Annual Report Filing",
        description: "Requirements for annual reports",
        fullMessage: "What are the requirements for a company's annual report (årsredovisning)? What must be included?"
    },
    {
        title: "Tax Calendar",
        description: "Important tax dates and deadlines",
        fullMessage: "What are the main tax dates and deadlines I should remember throughout the year in Sweden?"
    },
    {
        title: "F-Tax Registration",
        description: "Register for F-tax as self-employed",
        fullMessage: "Can you explain F-tax (F-skatt) for sole traders? How do I register and what benefits does it provide?"
    },
    {
        title: "VAT Registration",
        description: "When and how to register for VAT",
        fullMessage: "When do I need to register for VAT (momsregistrering)? What's the threshold and what's the procedure?"
    }
];

/**
 * Получить 3 случайных быстрых сообщения
 */
export function getRandomQuickMessages(): QuickMessage[] {
    const shuffled = [...QUICK_MESSAGES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
}
