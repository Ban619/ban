import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Users,
  Image,
  Music,
  Video,
  BookOpen,
  CheckSquare,
  Settings,
  LogOut,
  Shield,
  Home,
} from "lucide-react";

interface SidebarProps {
  isAdmin?: boolean;
}

const Sidebar = ({ isAdmin = false }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const userNavItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Users, label: "Social", path: "/dashboard/social" },
    { icon: Image, label: "Memories", path: "/dashboard/memories" },
    { icon: Music, label: "Music", path: "/dashboard/music" },
    { icon: Video, label: "Reels", path: "/dashboard/reels" },
    { icon: BookOpen, label: "StudyHub", path: "/dashboard/study" },
    { icon: CheckSquare, label: "Productivity", path: "/dashboard/productivity" },
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Shield, label: "Roles", path: "/admin/roles" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged out", description: "See you next time!" });
      navigate("/auth");
    }
  };

  return (
    <motion.aside
      className="w-64 h-screen fixed left-0 top-0 sidebar-gradient border-r border-border/30 flex flex-col"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border/30">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(265 80% 55%) 0%, hsl(225 85% 50%) 100%)",
            }}
          >
            <span className="text-lg font-display font-bold text-primary-foreground">Y</span>
          </div>
          <span className="text-xl font-display font-bold gradient-text">Yutende</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute left-0 w-1 h-8 rounded-r-full bg-primary"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {!isAdmin && (
          <div className="mt-8 pt-8 border-t border-border/30">
            <Link to="/admin" className="nav-link">
              <Shield className="w-5 h-5" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User Actions */}
      <div className="p-4 border-t border-border/30 space-y-1">
        <Link to="/dashboard/settings" className="nav-link">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <button onClick={handleLogout} className="nav-link w-full text-left">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
