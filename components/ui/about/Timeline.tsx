
import { motion } from "framer-motion";

interface TimelineItem {
  date: string;
  title: string;
  description?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

const Timeline = ({ items }: TimelineProps) => {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 lg:left-1/2 transform lg:-translate-x-1/2 h-full w-0.5 bg-purple-200"></div>

      {items.map((item, index) => (
        <div 
          key={index} 
          className={`relative flex items-center mb-12 ${
            index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="w-full lg:w-1/2 lg:pr-8 lg:pl-0 px-8"
          >
            <span className="text-sm font-semibold text-purple-600 block mb-1">{item.date}</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
            {item.description && <p className="text-gray-600">{item.description}</p>}
          </motion.div>

          {/* Dot */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            className="absolute left-4 lg:left-1/2 transform lg:-translate-x-1/2 w-5 h-5 rounded-full bg-purple-600 z-10"
          ></motion.div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
