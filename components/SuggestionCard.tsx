interface SuggestionCardProps {
    title: string;
    description: string;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ title, description }) => {
    return (
        <div className="glass-panel p-4 md:p-5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group h-full flex flex-col justify-between min-w-[200px] md:min-w-0 shrink-0 md:shrink snap-center">
            <div>
                <h3 className="text-zinc-100 font-semibold mb-1.5 md:mb-2 text-sm md:text-base">{title}</h3>
                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
};