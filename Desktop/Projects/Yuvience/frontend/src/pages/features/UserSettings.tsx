import { motion } from "framer-motion";
import { User, Camera, Mail, Lock, Bell, Shield, Palette, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const UserSettings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        setProfile(data);
      }
      setLoading(false);
    };
    getProfile();
  }, []);

  const settingsSections = [
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        { label: "Push notifications", description: "Receive push notifications", enabled: true },
        { label: "Email notifications", description: "Receive email updates", enabled: true },
        { label: "Social updates", description: "Get notified about likes and comments", enabled: false },
      ],
    },
    {
      title: "Privacy",
      icon: Shield,
      settings: [
        { label: "Private account", description: "Only approved followers can see your content", enabled: false },
        { label: "Activity status", description: "Show when you're online", enabled: true },
        { label: "Read receipts", description: "Let others know when you've read messages", enabled: true },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        className="glass-card p-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="feature-icon w-10 h-10">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-display font-semibold text-foreground">Profile</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center relative group cursor-pointer">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-3xl font-display font-bold text-primary-foreground">
                  {profile?.full_name?.charAt(0) || "Y"}
                </span>
              )}
              <div className="absolute inset-0 rounded-full bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-foreground" />
              </div>
            </div>
            <button className="mt-3 text-sm text-primary hover:text-primary/80 transition-colors">
              Change photo
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
              <Input
                id="fullName"
                defaultValue={profile?.full_name || ""}
                className="input-dark mt-1.5"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                defaultValue={profile?.username || ""}
                className="input-dark mt-1.5"
                placeholder="@username"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="bio" className="text-foreground">Bio</Label>
              <Input
                id="bio"
                defaultValue={profile?.bio || ""}
                className="input-dark mt-1.5"
                placeholder="Tell us about yourself"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button className="btn-primary">Save Changes</Button>
        </div>
      </motion.div>

      {/* Account Security */}
      <motion.div
        className="glass-card p-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="feature-icon w-10 h-10">
            <Lock className="w-5 h-5 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-display font-semibold text-foreground">Account Security</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              className="input-dark mt-1.5"
              placeholder="your@email.com"
              disabled
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="password"
                type="password"
                className="input-dark"
                placeholder="••••••••"
                disabled
              />
              <Button variant="outline">Change</Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Other Settings */}
      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          className="glass-card p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 + sectionIndex * 0.1, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="feature-icon w-10 h-10">
              <section.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-display font-semibold text-foreground">{section.title}</h2>
          </div>

          <div className="space-y-6">
            {section.settings.map((setting) => (
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
    </div>
  );
};

export default UserSettings;
