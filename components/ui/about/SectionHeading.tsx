
import { motion } from "framer-motion";
import GradientText from "./GradientText";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center" | "right";
  useGradient?: boolean;
}

const SectionHeading = ({ 
  title, 
  subtitle, 
  className = "", 
  align = "center",
  useGradient = false
}: SectionHeadingProps) => {
  
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  }[align];
  
  return (
    <div className={`mb-12 ${alignClass} ${className}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {useGradient ? (
          <GradientText 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 tracking-tight"
            animate={true}
          >
            {title}
          </GradientText>
        ) : (
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 tracking-tight">
            {title}
          </h2>
        )}
      </motion.div>
      
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeading;
