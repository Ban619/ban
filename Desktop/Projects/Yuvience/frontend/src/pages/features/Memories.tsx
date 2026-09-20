import { motion } from "framer-motion";
import { Plus, Grid, Image as ImageIcon, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const Memories = () => {
  const albums = [
    { id: 1, name: "Summer 2024", count: 48, cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop" },
    { id: 2, name: "Family", count: 124, cover: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=300&fit=crop" },
    { id: 3, name: "Travel", count: 89, cover: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=300&h=300&fit=crop" },
    { id: 4, name: "Friends", count: 67, cover: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=300&fit=crop" },
  ];

  const recentPhotos = [
    "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1682686578707-140b042e8f19?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1682695798256-28a674122872?w=400&h=400&fit=crop",
  ];

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
            My <span className="gradient-text">Memories</span>
          </h1>
          <p className="text-muted-foreground">Preserve your precious moments forever.</p>
        </div>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Album
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {[
          { label: "Total Photos", value: "328", icon: ImageIcon },
          { label: "Albums", value: "12", icon: Grid },
          { label: "Favorites", value: "56", icon: Heart },
          { label: "This Month", value: "24", icon: Calendar },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Albums */}
      <div>
        <motion.h2
          className="text-xl font-display font-semibold text-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Albums
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {albums.map((album, index) => (
            <motion.div
              key={album.id}
              className="group cursor-pointer"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-3 relative">
                <img
                  src={album.cover}
                  alt={album.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-medium text-foreground">{album.name}</h3>
              <p className="text-sm text-muted-foreground">{album.count} photos</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Photos */}
      <div>
        <motion.h2
          className="text-xl font-display font-semibold text-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Recent Photos
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentPhotos.map((photo, index) => (
            <motion.div
              key={index}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer group"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
            >
              <img
                src={photo}
                alt=""
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Memories;
