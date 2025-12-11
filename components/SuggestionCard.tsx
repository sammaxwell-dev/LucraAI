interface SuggestionCardProps {
    title: string;
    description: string;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ title, description }) => {
    return (
        <div className="glass-panel p-5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group h-full flex flex-col justify-between">
            <div>
                <h3 className="text-zinc-100 font-semibold mb-2">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
};