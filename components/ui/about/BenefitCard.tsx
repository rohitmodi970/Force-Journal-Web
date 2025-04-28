
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BenefitCardProps {
  title: string;
  description: string[];
  icon?: ReactNode;
  index?: number;
}

const BenefitCard = ({ 
  title, 
  description, 
  icon, 
  index = 0 
}: BenefitCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.2,
        ease: "easeOut" 
      }}
      className="bg-white p-6 rounded-xl border border-gray-100 shadow transition-all duration-300"
    >
      <div className="flex items-start space-x-4">
        {icon && (
          <div className="mt-1 text-purple-600 bg-purple-50 p-3 rounded-lg">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
          <ul className="space-y-2">
            {description.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-purple-600 mr-2 mt-1">•</span>
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default BenefitCard;
