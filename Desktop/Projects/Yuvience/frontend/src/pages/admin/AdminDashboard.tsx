import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, Activity, TrendingUp, Eye, BarChart3, PieChart } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartPie, Pie, Cell } from "recharts";

const AdminDashboard = () => {
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      setUsersCount(count || 0);
    };
    fetchStats();
  }, []);

  const stats = [
    { title: "Total Users", value: usersCount.toLocaleString(), change: "+18% from last month", changeType: "positive" as const, icon: Users },
    { title: "Active Sessions", value: "342", change: "+5% from yesterday", changeType: "positive" as const, icon: Activity },
    { title: "Page Views", value: "12.5K", change: "+32% this week", changeType: "positive" as const, icon: Eye },
    { title: "Engagement Rate", value: "68%", change: "+4.2%", changeType: "positive" as const, icon: TrendingUp },
  ];

  const chartData = [
    { name: "Jan", users: 400, views: 2400 },
    { name: "Feb", users: 600, views: 3200 },
    { name: "Mar", users: 800, views: 4100 },
    { name: "Apr", users: 1200, views: 5800 },
    { name: "May", users: 1600, views: 7200 },
    { name: "Jun", users: 2100, views: 9100 },
  ];

  const pieData = [
    { name: "Social", value: 35, color: "#ec4899" },
    { name: "Music", value: 25, color: "#22c55e" },
    { name: "Study", value: 20, color: "#3b82f6" },
    { name: "Videos", value: 15, color: "#a855f7" },
    { name: "Other", value: 5, color: "#6b7280" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage your platform's performance.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <motion.div
          className="lg:col-span-2 chart-container"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="feature-icon w-10 h-10">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">User Growth</h3>
              <p className="text-sm text-muted-foreground">Monthly user registrations</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 20%)" />
              <XAxis dataKey="name" stroke="hsl(240 8% 55%)" fontSize={12} />
              <YAxis stroke="hsl(240 8% 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(240 12% 10%)",
                  border: "1px solid hsl(240 10% 18%)",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="users" stroke="#a855f7" fill="url(#colorUsers)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Feature Usage Pie */}
        <motion.div
          className="chart-container"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="feature-icon w-10 h-10">
              <PieChart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Feature Usage</h3>
              <p className="text-sm text-muted-foreground">User activity by feature</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RechartPie>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(240 12% 10%)",
                  border: "1px solid hsl(240 10% 18%)",
                  borderRadius: "8px",
                }}
              />
            </RechartPie>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Page Views Chart */}
      <motion.div
        className="chart-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="feature-icon w-10 h-10">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Page Views Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly page views analytics</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 20%)" />
            <XAxis dataKey="name" stroke="hsl(240 8% 55%)" fontSize={12} />
            <YAxis stroke="hsl(240 8% 55%)" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "hsl(240 12% 10%)",
                border: "1px solid hsl(240 10% 18%)",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
