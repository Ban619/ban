import { motion } from "framer-motion";
import { Shield, UserCheck, Users, Settings } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

const AdminRoles = () => {
  const roles = [
    {
      name: "Admin",
      description: "Full access to all features and settings",
      users: 2,
      permissions: ["Manage users", "View analytics", "Edit content", "System settings"],
      color: "from-red-500 to-rose-500",
    },
    {
      name: "User",
      description: "Standard access to platform features",
      users: 1250,
      permissions: ["View content", "Create posts", "Use features", "Edit profile"],
      color: "from-primary to-accent",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Role <span className="gradient-text">Management</span>
        </h1>
        <p className="text-muted-foreground">Manage user roles and permissions.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Roles" value="2" icon={Shield} delay={0.1} />
        <StatsCard title="Admin Users" value="2" icon={UserCheck} delay={0.2} />
        <StatsCard title="Regular Users" value="1,250" icon={Users} delay={0.3} />
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role, index) => (
          <motion.div
            key={role.name}
            className="glass-card-hover p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${role.color}`}>
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-foreground">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">{role.users} users</p>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <p className="text-muted-foreground text-sm mb-4">{role.description}</p>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-3 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminRoles;
