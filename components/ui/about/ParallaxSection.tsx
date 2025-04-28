
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ParallaxSectionProps {
  className?: string;
  bgColor?: string;
  children: React.ReactNode;
}

const ParallaxSection = ({
  className = "",
  bgColor = "bg-gradient-to-b from-purple-50 to-white",
  children
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section 
      ref={ref}
      className={`relative overflow-hidden py-20 ${bgColor} ${className}`}
    >
      <motion.div style={{ y }} className="relative z-10">
        {children}
      </motion.div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-purple-200 opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-indigo-200 opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-300 opacity-10"></div>
      </div>
    </section>
  );
};

export default ParallaxSection;
