import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  gradient?: string;
  delay?: number;
}

const FeatureCard = ({
  title,
  description,
  icon: Icon,
  path,
  gradient = "from-primary to-accent",
  delay = 0,
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link to={path}>
        <div className="glass-card-hover p-6 h-full group cursor-pointer">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="w-7 h-7 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default FeatureCard;
