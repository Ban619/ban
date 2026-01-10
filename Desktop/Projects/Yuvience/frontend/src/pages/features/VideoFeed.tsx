import { motion } from "framer-motion";
import { Play, Heart, MessageCircle, Share2, Music2, Bookmark } from "lucide-react";

const VideoFeed = () => {
  const videos = [
    {
      id: 1,
      user: { name: "Creative Studios", username: "creativestudios" },
      description: "Amazing sunset timelapse from our latest shoot 🌅 #photography #sunset",
      likes: "12.5K",
      comments: "234",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=700&fit=crop",
      audio: "Original Sound",
    },
    {
      id: 2,
      user: { name: "Dance Vibes", username: "dancevibes" },
      description: "New choreography just dropped! 💃 Let me know what you think",
      likes: "45.2K",
      comments: "1.2K",
      thumbnail: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=700&fit=crop",
      audio: "Trending Sound #1",
    },
    {
      id: 3,
      user: { name: "Food Magic", username: "foodmagic" },
      description: "Wait for the end... 🍕 Best pizza recipe ever!",
      likes: "89.1K",
      comments: "3.4K",
      thumbnail: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=700&fit=crop",
      audio: "Cooking Beats",
    },
    {
      id: 4,
      user: { name: "Tech Tips", username: "techtips" },
      description: "5 iPhone tricks you didn't know! 📱 Save for later",
      likes: "156K",
      comments: "5.6K",
      thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=700&fit=crop",
      audio: "Tech Tutorial",
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
          <span className="gradient-text">Videos</span>
        </h1>
        <p className="text-muted-foreground">Discover trending short-form content.</p>
      </motion.div>

      {/* Video Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            className="relative group cursor-pointer rounded-xl overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
          >
            {/* Video Thumbnail */}
            <div className="aspect-[9/16] bg-muted relative">
              <img
                src={video.thumbnail}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-primary/80 backdrop-blur flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                </div>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-foreground">
                      {video.user.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">@{video.user.username}</span>
                </div>
                <p className="text-sm text-foreground/90 line-clamp-2">{video.description}</p>
                
                {/* Audio */}
                <div className="flex items-center gap-2 mt-2">
                  <Music2 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{video.audio}</span>
                </div>
              </div>

              {/* Side Actions */}
              <div className="absolute right-2 bottom-20 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-background/50 backdrop-blur flex items-center justify-center">
                    <Heart className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-xs text-foreground mt-1">{video.likes}</span>
                </button>
                <button className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-background/50 backdrop-blur flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-xs text-foreground mt-1">{video.comments}</span>
                </button>
                <button className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-background/50 backdrop-blur flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-foreground" />
                  </div>
                </button>
                <button className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-background/50 backdrop-blur flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-foreground" />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trending Section */}
      <div>
        <motion.h2
          className="text-xl font-display font-semibold text-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Trending Sounds
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Original Sound - User", uses: "2.4M" },
            { name: "Viral Dance Mix", uses: "1.8M" },
            { name: "Trending Beat 2024", uses: "945K" },
            { name: "Comedy Audio #1", uses: "567K" },
          ].map((sound, index) => (
            <motion.div
              key={sound.name}
              className="glass-card-hover p-4 flex items-center gap-3 cursor-pointer"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Music2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{sound.name}</p>
                <p className="text-sm text-muted-foreground">{sound.uses} uses</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
