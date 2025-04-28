
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EcosystemCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  index?: number;
  color?: "purple" | "blue" | "pink" | "green";
}

const EcosystemCard = ({ 
  title, 
  description, 
  icon, 
  index = 0,
  color = "purple"
}: EcosystemCardProps) => {
  
  const colorClasses = {
    purple: "from-purple-500 to-indigo-600",
    blue: "from-blue-500 to-cyan-600",
    pink: "from-pink-500 to-rose-600",
    green: "from-emerald-500 to-teal-600",
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut" 
      }}
      whileHover={{ 
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="rounded-xl overflow-hidden shadow-lg"
    >
      <div className={`h-24 bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}>
        {icon && <div className="text-white text-3xl">{icon}</div>}
      </div>
      <div className="bg-white p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

export default EcosystemCard;
