import { motion } from 'framer-motion';
import { EASE } from '../lib/motion.js';

const variants = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

export default function PageTransition({ children }) {
  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}