import { motion } from 'framer-motion';
import { slow } from '../lib/motion.js';

export default function Reveal({ children, delay = 0, y = 36, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={slow(delay)}
    >
      {children}
    </motion.div>
  );
}