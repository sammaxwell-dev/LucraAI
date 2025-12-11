'use client';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'logo-sm',
        md: 'logo-md',
        lg: 'logo-lg'
    };

    return (
        <div className={`logo-container ${sizeClasses[size]}`}>
            {/* Animated orb behind the text */}
            <div className="logo-orb">
                <div className="logo-orb-fluid"></div>
                <div className="logo-orb-core"></div>
                <div className="logo-orb-reflection"></div>
            </div>

            {/* Logo text */}
            <span className="logo-text">
                <span className="logo-lucra">Lucra</span>
                <span className="logo-ai">AI</span>
            </span>
        </div>
    );
};
