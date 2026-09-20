import { motion } from "framer-motion";
import { CheckSquare, Plus, Clock, Calendar, AlertCircle, CheckCircle2, Circle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Productivity = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Complete project proposal", completed: false, priority: "high", dueDate: "Today" },
    { id: 2, title: "Review team feedback", completed: true, priority: "medium", dueDate: "Today" },
    { id: 3, title: "Update documentation", completed: false, priority: "low", dueDate: "Tomorrow" },
    { id: 4, title: "Schedule client meeting", completed: false, priority: "high", dueDate: "Today" },
    { id: 5, title: "Design system updates", completed: true, priority: "medium", dueDate: "Yesterday" },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const stats = [
    { label: "Total Tasks", value: tasks.length, icon: CheckSquare, color: "from-primary to-accent" },
    { label: "Completed", value: tasks.filter(t => t.completed).length, icon: CheckCircle2, color: "from-green-500 to-emerald-500" },
    { label: "In Progress", value: tasks.filter(t => !t.completed).length, icon: Clock, color: "from-amber-500 to-orange-500" },
    { label: "High Priority", value: tasks.filter(t => t.priority === "high" && !t.completed).length, icon: AlertCircle, color: "from-red-500 to-rose-500" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400";
      case "medium": return "bg-amber-500/20 text-amber-400";
      case "low": return "bg-green-500/20 text-green-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            <span className="gradient-text">Productivity</span>
          </h1>
          <p className="text-muted-foreground">Stay organized and get things done.</p>
        </div>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
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

      {/* Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <motion.div
          className="lg:col-span-2 glass-card p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold text-foreground">Today's Tasks</h2>
            <span className="text-sm text-muted-foreground">
              {tasks.filter(t => t.completed).length}/{tasks.length} completed
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                className={`p-4 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors ${
                  task.completed ? "opacity-60" : ""
                }`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: task.completed ? 0.6 : 1 }}
                transition={{ delay: 0.4 + index * 0.05, duration: 0.4 }}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions & Calendar */}
        <div className="space-y-6">
          <motion.div
            className="glass-card p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="feature-icon w-10 h-10">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground">Upcoming</h3>
            </div>
            <div className="space-y-3">
              {[
                { time: "9:00 AM", event: "Team standup", color: "bg-blue-500" },
                { time: "11:00 AM", event: "Client call", color: "bg-green-500" },
                { time: "2:00 PM", event: "Design review", color: "bg-primary" },
                { time: "4:00 PM", event: "Code review", color: "bg-amber-500" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-muted-foreground w-20">{item.time}</span>
                  <span className="text-sm text-foreground">{item.event}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="glass-card p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h3 className="font-display font-semibold text-foreground mb-4">Focus Timer</h3>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-primary/30 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" style={{ animationDuration: "3s" }} />
                <div className="text-center">
                  <p className="text-3xl font-display font-bold text-foreground">25:00</p>
                  <p className="text-xs text-muted-foreground">minutes</p>
                </div>
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <Button size="sm" className="btn-primary">Start</Button>
                <Button size="sm" variant="outline">Reset</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Productivity;
