
import { Instagram, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

const socials = [
  {
    name: "Twitter",
    href: "https://twitter.com/",
    icon: Twitter,
    color: "bg-gradient-to-r from-blue-400 to-purple-500",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/",
    icon: Linkedin,
    color: "bg-gradient-to-r from-indigo-500 to-blue-700",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/",
    icon: Instagram,
    color: "bg-gradient-to-tr from-pink-500 to-yellow-400",
  },
];

export default function SocialLinks() {
  return (
    <div className="flex justify-center gap-6 mt-8">
      {socials.map(({ name, href, icon: Icon, color }, i) => (
        <motion.a
          key={name}
          href={href}
          aria-label={name}
          target="_blank"
          rel="noopener"
          whileHover={{ scale: 1.18, rotate: -5 + i * 5 }}
          whileTap={{ scale: 0.95 }}
          className={`${color} rounded-full p-2 shadow-xl transition-all`}
        >
          <Icon size={28} className="text-white drop-shadow-md" />
        </motion.a>
      ))}
    </div>
  );
}
