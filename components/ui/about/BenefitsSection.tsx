
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import BenefitCard from "./BenefitCard";
import BackgroundParticles from "./BackgroundParticles";
import { Brain, Sparkles, Star } from "lucide-react";

const cardVariants = {
  rest: { y: 0, boxShadow: "0 2px 12px rgba(124, 58, 237, 0.10)" },
  hover: { y: -12, boxShadow: "0 6px 28px 0 rgba(124, 58, 237, 0.16)" }
};

const BenefitsSection = () => (
  <section className="relative py-24 md:py-32 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-950 dark:to-black overflow-hidden z-10">
    <BackgroundParticles count={15} color="blue" variant="subtle" />
    
    <div className="container mx-auto px-4 relative z-10">
      <SectionHeading
        title="How Force Benefits You"
        subtitle="Tailored solutions for various personal and professional needs."
        useGradient={true}
      />
      
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 relative"
      >
        {/* Central connecting element */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-r from-purple-300/30 to-indigo-300/30 dark:from-purple-700/30 dark:to-indigo-700/20 blur-xl hidden md:block"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[{
            title: "For Personal Growth Seekers",
            icon: <Brain />,
            description: [
              "Understand your thought patterns to achieve higher consciousness",
              "Identify mental tendencies that limit your potential",
              "Track your progress toward greater self-awareness",
              "Connect with like-minded individuals on similar journeys"
            ]
          }, {
            title: "For Knowledge Workers & Professionals",
            icon: <Sparkles />,
            description: [
              "Organize complex ideas with intelligent structure",
              "Surface valuable connections between disparate information",
              "Track and optimize decision-making patterns",
              "Capture and refine professional insights over time"
            ]
          }, {
            title: "For Creative Thinkers",
            icon: <Star />,
            description: [
              "Document creative processes and inspiration sources",
              "Develop ideas through guided reflection and analysis",
              "Discover unexpected connections that spark innovation",
              "Build a searchable archive of creative concepts"
            ]
          }].map((props, i) => (
            <motion.div
              variants={cardVariants}
              initial="rest"
              whileHover="hover"
              transition={{ type: "spring", stiffness: 260, damping: 12 }}
              key={props.title}
              className="relative z-10"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 * i }}
              >
                <BenefitCard
                  title={props.title}
                  description={props.description}
                  icon={props.icon}
                  index={i}
                />
              </motion.div>
              
              {/* Add connecting lines between cards (visible on desktop) */}
              {i < 2 && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  whileInView={{ width: "100%", opacity: 0.6 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 1 + (0.2 * i) }}
                  className="absolute top-14 -right-6 h-0.5 bg-gradient-to-r from-purple-400/40 to-indigo-400/40 w-12 hidden md:block"
                  style={{ zIndex: -1 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
    
    {/* Add 3D-like decorative elements */}
    <motion.div
      className="absolute bottom-0 right-0 w-40 h-40 md:w-60 md:h-60"
      animate={{ 
        rotateX: [0, 10, 0], 
        rotateY: [0, 15, 0],
        z: [0, 20, 0]
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 20, 
        ease: "easeInOut" 
      }}
    >
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-10 dark:opacity-20">
        <defs>
          <linearGradient id="benefitsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9B87F5" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <path fill="url(#benefitsGradient)" d="M38.5,-65.3C45.8,-55.1,45.4,-38,51.6,-24.5C57.7,-11.1,70.3,-1.4,71.9,8.7C73.5,18.9,64,29.5,53.8,37.5C43.7,45.4,32.9,50.8,21.4,53.6C9.9,56.4,-2.3,56.7,-12.9,53C-23.4,49.3,-32.4,41.6,-40.6,32.8C-48.8,24.1,-56.2,14.2,-60.5,1.8C-64.8,-10.6,-65.9,-26.7,-58.6,-37.6C-51.3,-48.4,-35.6,-54.1,-22.3,-61.8C-9,-69.5,2,-79.2,13.8,-79C25.6,-78.8,38.2,-68.7,44.7,-58.2Z" transform="translate(100 100)" />
      </svg>
    </motion.div>
  </section>
);

export default BenefitsSection;
