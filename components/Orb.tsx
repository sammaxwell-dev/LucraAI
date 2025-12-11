import React from 'react';

// This component uses the updated realistic Skatteverket styles in index.html
export const Orb: React.FC = () => {
    return (
        <div className="orb-container">
            <div className="orb-inner-fluid"></div>
            <div className="orb-core"></div>
            <div className="orb-reflection"></div>
        </div>
    );
};