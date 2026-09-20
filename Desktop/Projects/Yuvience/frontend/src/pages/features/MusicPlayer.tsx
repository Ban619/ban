import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat, Music2 } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([35]);

  const playlists = [
    { name: "Chill Vibes", songs: 24, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" },
    { name: "Workout Mix", songs: 18, cover: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop" },
    { name: "Focus Mode", songs: 32, cover: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&h=200&fit=crop" },
    { name: "Late Night", songs: 15, cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop" },
  ];

  const recentTracks = [
    { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop" },
    { title: "Levitating", artist: "Dua Lipa", duration: "3:23", cover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=100&h=100&fit=crop" },
    { title: "Stay", artist: "The Kid LAROI", duration: "2:21", cover: "https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?w=100&h=100&fit=crop" },
    { title: "Heat Waves", artist: "Glass Animals", duration: "3:58", cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=100&h=100&fit=crop" },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          <span className="gradient-text">Music</span>
        </h1>
        <p className="text-muted-foreground">Discover and enjoy your favorite tracks.</p>
      </motion.div>

      {/* Now Playing */}
      <motion.div
        className="glass-card p-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Album Art */}
          <div className="w-48 h-48 rounded-xl overflow-hidden shrink-0 relative group">
            <img
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
              alt="Now Playing"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-primary-foreground" />
                ) : (
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                )}
              </div>
            </div>
          </div>

          {/* Track Info & Controls */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-display font-bold text-foreground">Blinding Lights</h2>
            <p className="text-muted-foreground mb-6">The Weeknd</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={progress}
                onValueChange={setProgress}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">1:10</span>
                <span className="text-xs text-muted-foreground">3:20</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Shuffle className="w-5 h-5" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-primary-foreground" />
                ) : (
                  <Play className="w-7 h-7 text-primary-foreground ml-1" />
                )}
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Repeat className="w-5 h-5" />
              </button>
              <div className="hidden md:flex items-center gap-2 ml-4">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <Slider defaultValue={[70]} max={100} className="w-24" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Playlists */}
      <div>
        <motion.h2
          className="text-xl font-display font-semibold text-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your Playlists
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {playlists.map((playlist, index) => (
            <motion.div
              key={playlist.name}
              className="glass-card-hover p-4 group cursor-pointer"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                <img
                  src={playlist.cover}
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                </div>
              </div>
              <h3 className="font-medium text-foreground">{playlist.name}</h3>
              <p className="text-sm text-muted-foreground">{playlist.songs} songs</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Tracks */}
      <div>
        <motion.h2
          className="text-xl font-display font-semibold text-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Recently Played
        </motion.h2>
        <div className="space-y-2">
          {recentTracks.map((track, index) => (
            <motion.div
              key={track.title}
              className="glass-card p-3 flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer group"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                <img src={track.cover} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{track.title}</p>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>
              <button className="p-2 text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <Heart className="w-5 h-5" />
              </button>
              <span className="text-sm text-muted-foreground">{track.duration}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
