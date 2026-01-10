import { motion } from "framer-motion";
import { Users, Image, Music, Video, BookOpen, CheckSquare, TrendingUp, Activity } from "lucide-react";
import FeatureCard from "@/components/dashboard/FeatureCard";
import StatsCard from "@/components/dashboard/StatsCard";

const Dashboard = () => {
  const features = [
    {
      title: "Social Feed",
      description: "Connect with friends, share moments, and stay updated with your network.",
      icon: Users,
      path: "/dashboard/social",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      title: "Memories",
      description: "Create beautiful albums to preserve your precious moments forever.",
      icon: Image,
      path: "/dashboard/memories",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Music",
      description: "Discover, stream, and enjoy your favorite music all in one place.",
      icon: Music,
      path: "/dashboard/music",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Videos",
      description: "Watch short-form videos and discover trending content.",
      icon: Video,
      path: "/dashboard/videos",
      gradient: "from-primary to-accent",
    },
    {
      title: "StudyHub",
      description: "Access learning resources, take notes, and track your progress.",
      icon: BookOpen,
      path: "/dashboard/study",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      title: "Productivity",
      description: "Manage tasks, set goals, and boost your daily productivity.",
      icon: CheckSquare,
      path: "/dashboard/productivity",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  const stats = [
    { title: "Total Connections", value: "1,234", change: "+12% from last month", changeType: "positive" as const, icon: Users },
    { title: "Photos Saved", value: "856", change: "+23 this week", changeType: "positive" as const, icon: Image },
    { title: "Songs Played", value: "2.3K", change: "42 hours listened", changeType: "neutral" as const, icon: Music },
    { title: "Tasks Completed", value: "89%", change: "+5% productivity", changeType: "positive" as const, icon: Activity },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Welcome to <span className="gradient-text">Yutende</span>
        </h1>
        <p className="text-muted-foreground">
          Your all-in-one platform for social, entertainment, and productivity.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Quick Stats Bar */}
      <motion.div
        className="glass-card p-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="feature-icon">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Your Activity</h3>
              <p className="text-sm text-muted-foreground">You're 23% more active than last week!</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-foreground">156</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-foreground">2.1K</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-foreground">48</p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div>
        <motion.h2
          className="text-xl font-display font-semibold text-foreground mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Explore Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={0.5 + index * 0.1} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
