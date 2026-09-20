import { motion } from "framer-motion";
import { Settings, Bell, Shield, Palette, Globe, Database } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const AdminSettings = () => {
  const settingSections = [
    {
      title: "General",
      icon: Settings,
      settings: [
        { label: "Enable registration", description: "Allow new users to sign up", enabled: true },
        { label: "Maintenance mode", description: "Show maintenance page to users", enabled: false },
        { label: "Email verification", description: "Require email verification for new accounts", enabled: true },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        { label: "Admin alerts", description: "Receive alerts for important events", enabled: true },
        { label: "User activity", description: "Get notified about user activities", enabled: false },
        { label: "System updates", description: "Receive system update notifications", enabled: true },
      ],
    },
    {
      title: "Security",
      icon: Shield,
      settings: [
        { label: "Two-factor auth", description: "Require 2FA for admin accounts", enabled: true },
        { label: "Session timeout", description: "Auto logout after inactivity", enabled: true },
        { label: "IP restriction", description: "Restrict admin access by IP", enabled: false },
      ],
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
          System <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-muted-foreground">Configure platform settings and preferences.</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {[
          { icon: Database, label: "Backup Data", color: "from-blue-500 to-cyan-500" },
          { icon: Palette, label: "Customize Theme", color: "from-primary to-accent" },
          { icon: Globe, label: "API Settings", color: "from-green-500 to-emerald-500" },
        ].map((action, index) => (
          <button
            key={action.label}
            className="glass-card-hover p-4 flex items-center gap-4 text-left group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${action.color}`}>
              <action.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          className="glass-card p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 + sectionIndex * 0.1, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="feature-icon w-10 h-10">
              <section.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-display font-semibold text-foreground">{section.title}</h2>
          </div>

          <div className="space-y-6">
            {section.settings.map((setting, index) => (
              <div key={setting.label} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">{setting.label}</Label>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <Switch defaultChecked={setting.enabled} />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Save Button */}
      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button className="btn-primary">Save Changes</Button>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
