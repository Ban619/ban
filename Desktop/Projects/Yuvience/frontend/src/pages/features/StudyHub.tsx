import { motion } from "framer-motion";
import { BookOpen, Clock, Trophy, Target, FileText, Video, Bookmark, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const StudyHub = () => {
  const courses = [
    { title: "React Mastery", progress: 75, lessons: 24, image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop" },
    { title: "Python for Data Science", progress: 45, lessons: 32, image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=300&h=200&fit=crop" },
    { title: "UI/UX Design", progress: 90, lessons: 18, image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop" },
    { title: "Machine Learning", progress: 20, lessons: 40, image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop" },
  ];

  const stats = [
    { label: "Hours Studied", value: "156", icon: Clock, color: "from-blue-500 to-cyan-500" },
    { label: "Courses Completed", value: "8", icon: Trophy, color: "from-amber-500 to-orange-500" },
    { label: "Current Streak", value: "12 days", icon: TrendingUp, color: "from-green-500 to-emerald-500" },
    { label: "Goals Met", value: "24", icon: Target, color: "from-primary to-accent" },
  ];

  const resources = [
    { title: "JavaScript Fundamentals", type: "PDF", size: "2.4 MB" },
    { title: "Design Principles Guide", type: "PDF", size: "5.1 MB" },
    { title: "Database Basics", type: "Video", size: "45 min" },
    { title: "API Development", type: "PDF", size: "3.2 MB" },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          <span className="gradient-text">StudyHub</span>
        </h1>
        <p className="text-muted-foreground">Learn, grow, and achieve your goals.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="glass-card p-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Continue Learning */}
      <div>
        <motion.h2
          className="text-xl font-display font-semibold text-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Continue Learning
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course, index) => (
            <motion.div
              key={course.title}
              className="glass-card-hover overflow-hidden cursor-pointer group"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            >
              <div className="flex gap-4">
                <div className="w-32 h-24 shrink-0 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 py-3 pr-4">
                  <h3 className="font-medium text-foreground mb-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{course.lessons} lessons</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Resources */}
        <motion.div
          className="glass-card p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="feature-icon w-10 h-10">
              <Bookmark className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-foreground">Saved Resources</h3>
          </div>
          <div className="space-y-3">
            {resources.map((resource, index) => (
              <div
                key={resource.title}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  {resource.type === "PDF" ? (
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Video className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{resource.title}</p>
                  <p className="text-sm text-muted-foreground">{resource.type} • {resource.size}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Study Goals */}
        <motion.div
          className="glass-card p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="feature-icon w-10 h-10">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-foreground">Weekly Goals</h3>
          </div>
          <div className="space-y-4">
            {[
              { goal: "Complete 5 lessons", current: 3, target: 5 },
              { goal: "Study 10 hours", current: 7, target: 10 },
              { goal: "Take 2 quizzes", current: 2, target: 2 },
              { goal: "Review notes", current: 4, target: 7 },
            ].map((item, index) => (
              <div key={item.goal}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{item.goal}</span>
                  <span className="text-muted-foreground">{item.current}/{item.target}</span>
                </div>
                <Progress value={(item.current / item.target) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudyHub;
