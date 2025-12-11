import { motion } from 'framer-motion';

interface OrbProps {
    className?: string;
    layoutId?: string;
    isStatic?: boolean;
}

export const Orb: React.FC<OrbProps> = ({ className = "w-[140px] h-[140px]", layoutId, isStatic = false }) => {
    return (
        <motion.div
            className={`orb-container ${isStatic ? 'orb-static' : ''} ${className}`}
            layoutId={layoutId}
            layout
            transition={{
                type: "spring",
                stiffness: 150,
                damping: 25,
                mass: 1,
                duration: 0.6
            }}
        >
            <div className="orb-inner-fluid"></div>
            <div className="orb-core"></div>
            <div className="orb-reflection"></div>
        </motion.div>
    );
};