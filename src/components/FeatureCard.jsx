import { motion } from "framer-motion";

const FeatureCard = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay }}
    className={`bg-white/80 backdrop-blur-md border border-white p-5 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all ${className}`}
  >
    {children}
  </motion.div>
);
export default FeatureCard;