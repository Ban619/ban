import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ImagePlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SocialFeed = () => {
  const posts = [
    {
      id: 1,
      user: { name: "Alex Morgan", username: "alexm", avatar: null },
      content: "Just finished an amazing coding session! Building something special with Yutende 🚀",
      likes: 234,
      comments: 18,
      time: "2h ago",
      image: null,
    },
    {
      id: 2,
      user: { name: "Sarah Chen", username: "sarahc", avatar: null },
      content: "The sunset today was absolutely breathtaking. Sometimes you just need to pause and appreciate the little moments. 🌅",
      likes: 567,
      comments: 42,
      time: "4h ago",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    },
    {
      id: 3,
      user: { name: "Mike Johnson", username: "mikej", avatar: null },
      content: "New track dropping soon! Stay tuned for some fresh beats 🎵",
      likes: 891,
      comments: 76,
      time: "6h ago",
      image: null,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Social <span className="gradient-text">Feed</span>
        </h1>
        <p className="text-muted-foreground">Stay connected with your community.</p>
      </motion.div>

      {/* Create Post */}
      <motion.div
        className="glass-card p-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-muted-foreground">Y</span>
          </div>
          <div className="flex-1">
            <Input
              placeholder="What's on your mind?"
              className="input-dark border-0 bg-transparent px-0 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <ImagePlus className="w-5 h-5" />
                <span className="text-sm">Photo</span>
              </button>
              <Button size="sm" className="btn-primary">
                <Send className="w-4 h-4 mr-2" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts */}
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          className="glass-card overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
        >
          {/* Post Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {post.user.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{post.user.name}</p>
                <p className="text-sm text-muted-foreground">@{post.user.username} · {post.time}</p>
              </div>
            </div>
            <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-3">
            <p className="text-foreground">{post.content}</p>
          </div>

          {/* Post Image */}
          {post.image && (
            <div className="px-4 pb-3">
              <img src={post.image} alt="" className="w-full rounded-lg object-cover max-h-96" />
            </div>
          )}

          {/* Post Actions */}
          <div className="px-4 py-3 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-red-400 transition-colors group">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm">{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors group">
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SocialFeed;
