import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  X,
  Send,
  Smile,
  Paperclip,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  text?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  sender: 'user' | 'other';
  timestamp: Date;
}

const Reels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [messages, setMessages] = useState<{ [key: number]: Message[] }>({});
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [mediaAspectRatio, setMediaAspectRatio] = useState<'landscape' | 'portrait' | 'square'>('square');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  interface Reel {
    id: string;
    userId: string;
    user: {
      id: string;
      username: string;
      full_name: string;
      avatar_url?: string;
    };
    content: string;
    video_url: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    is_liked?: boolean;
    is_bookmarked?: boolean;
  }

  // Sample reels data (replace with API call)
  useEffect(() => {
    const sampleReels: Reel[] = [
      {
        id: "1",
        userId: "user1",
        user: {
          id: "user1",
          username: "archiebentoncomposer",
          full_name: "Archie Benton",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Archie",
        },
        content: "my boyfriend making music 🎵",
        video_url:
          "https://media.giphy.com/media/3o6ZsYq8F0i42kvQjYo/giphy.mp4",
        likes_count: 37500,
        comments_count: 928,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        userId: "user2",
        user: {
          id: "user2",
          username: "dancevibes",
          full_name: "Dance Vibes",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dance",
        },
        content: "New choreography just dropped! 💃",
        video_url:
          "https://media.giphy.com/media/l0HlDy9x8FZo0XO1i/giphy.mp4",
        likes_count: 45200,
        comments_count: 1200,
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        userId: "user3",
        user: {
          id: "user3",
          username: "foodmagic",
          full_name: "Food Magic",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Food",
        },
        content: "Wait for the end... 🍕 Best pizza recipe ever!",
        video_url:
          "https://media.giphy.com/media/3o85xIO33l7RlmLDPO/giphy.mp4",
        likes_count: 89100,
        comments_count: 3400,
        created_at: new Date().toISOString(),
      },
    ];

    setReels(sampleReels);
    setLikeCount(sampleReels[0]?.likes_count || 0);
  }, []);

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsLiked(false);
      setIsBookmarked(false);
      setLikeCount(reels[currentIndex + 1]?.likes_count || 0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsLiked(false);
      setIsBookmarked(false);
      setLikeCount(reels[currentIndex - 1]?.likes_count || 0);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't handle if user is typing in an input field
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if (e.key === "ArrowUp") handlePrev();
    if (e.key === "ArrowDown") handleNext();
    if (e.key === " ") {
      e.preventDefault();
      if (videoRef.current) {
        videoRef.current.paused
          ? videoRef.current.play()
          : videoRef.current.pause();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || selectedUser === null) return;

    const newMessage = {
      id: Date.now().toString(),
      text: messageInput,
      sender: 'user' as const,
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), newMessage],
    }));

    setMessageInput("");
    setShowEmojiPicker(false);

    // Show typing indicator
    setIsTyping(true);

    // Simulate reply after a short delay
    setTimeout(() => {
      setIsTyping(false);
      const replyMessage = {
        id: Date.now().toString(),
        text: "That's awesome! 😊",
        sender: 'other' as const,
        timestamp: new Date(),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), replyMessage],
      }));
    }, 1000);
  };

  const addEmoji = (emoji: string) => {
    setMessageInput(messageInput + emoji);
    setShowEmojiPicker(false);
  };

  const deleteMessage = (messageId: string) => {
    if (selectedUser === null) return;
    setMessages((prev) => ({
      ...prev,
      [selectedUser]: (prev[selectedUser] || []).filter(
        (msg) => msg.id !== messageId
      ),
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || selectedUser === null) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Please select an image or video');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;

      if (isImage) {
        const img = new Image();
        img.onload = () => {
          const ratio = img.width / img.height;
          if (ratio > 1.2) setMediaAspectRatio('landscape');
          else if (ratio < 0.8) setMediaAspectRatio('portrait');
          else setMediaAspectRatio('square');

          sendMediaMessage(url, 'image');
        };
        img.src = url;
      } else {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          const ratio = video.videoWidth / video.videoHeight;
          if (ratio > 1.2) setMediaAspectRatio('landscape');
          else if (ratio < 0.8) setMediaAspectRatio('portrait');
          else setMediaAspectRatio('square');

          sendMediaMessage(url, 'video');
        };
        video.src = url;
      }
    };
    reader.readAsDataURL(file);
  };

  const sendMediaMessage = (url: string, type: 'image' | 'video') => {
    if (selectedUser === null) return;

    const mediaMessage: Message = {
      id: Date.now().toString(),
      media: {
        type,
        url,
      },
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), mediaMessage],
    }));

    setPreviewMedia(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Simulate reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMessage: Message = {
        id: Date.now().toString(),
        text: type === 'video' ? "Cool video! 🎬" : "Nice pic! 📸",
        sender: 'other',
        timestamp: new Date(),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), replyMessage],
      }));
    }, 1000);
  };

  const emojis = ["😀", "😂", "❤️", "👍", "🔥", "😍", "🎉", "🚀"];

  if (!reels.length) return <div className="h-screen bg-black" />;

  const currentReel = reels[currentIndex];

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full bg-black overflow-hidden"
    >
      {/* Main Video Container */}
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="relative h-full max-w-md w-full bg-black">
          {/* Video */}
          <video
            ref={videoRef}
            src={currentReel.video_url}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted={isMuted}
            playsInline
          />

          {/* Video Overlay Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Caption */}
          <div className="absolute bottom-20 left-4 right-12 text-white z-10">
            <div className="flex items-start gap-3">
              <img
                src={currentReel.user.avatar_url}
                alt={currentReel.user.username}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {currentReel.user.username}
                </p>
                <p className="text-sm opacity-90 mt-1">{currentReel.content}</p>
              </div>
            </div>
          </div>

          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-6 left-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition z-20"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {/* Right Sidebar Actions */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20">
          {/* Like Button */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className="flex flex-col items-center gap-2 group"
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              className={`p-3 rounded-full transition ${
                isLiked
                  ? "bg-red-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Heart
                size={24}
                fill={isLiked ? "currentColor" : "none"}
                strokeWidth={2}
              />
            </motion.div>
            <span className="text-white text-xs font-semibold">
              {(likeCount / 1000).toFixed(1)}K
            </span>
          </motion.button>

          {/* Comment Button */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
              <MessageCircle size={24} />
            </div>
            <span className="text-white text-xs font-semibold">
              {(currentReel.comments_count / 1000).toFixed(0)}K
            </span>
          </motion.button>

          {/* Share Button */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
              <Share2 size={24} />
            </div>
            <span className="text-white text-xs font-semibold">Share</span>
          </motion.button>

          {/* Bookmark Button */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={`p-3 rounded-full transition ${
                isBookmarked
                  ? "bg-yellow-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Bookmark size={24} fill={isBookmarked ? "currentColor" : "none"} />
            </div>
          </motion.button>

          {/* More Options */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
              <MoreVertical size={24} />
            </div>
          </motion.button>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronUp size={24} />
          </button>
        </div>

        <div className="absolute left-4 bottom-20 flex flex-col gap-4 z-20">
          <button
            onClick={handleNext}
            disabled={currentIndex === reels.length - 1}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </div>

      {/* Reel Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-20">
        {currentIndex + 1} / {reels.length}
      </div>

      {/* Messages Panel - Compact Floating */}
      <AnimatePresence>
        {isMessagesOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-8 right-8 w-80 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-2xl overflow-hidden shadow-2xl z-40 hidden lg:flex flex-col h-96"
          >
            {/* Header */}
            {!selectedUser ? (
              <>
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <h3 className="text-white font-semibold text-sm">Messages</h3>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold"
                    >
                      4
                    </motion.div>
                    <button
                      onClick={() => setIsMessagesOpen(false)}
                      className="p-1 hover:bg-gray-800 rounded-full transition"
                    >
                      <X size={18} className="text-gray-400 hover:text-white" />
                    </button>
                  </div>
                </div>

                {/* Message Items */}
                <div className="overflow-y-auto flex-1 space-y-2 p-2">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedUser(i)}
                      className="w-full flex items-center gap-3 cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition text-left"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
                        alt="user"
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-xs truncate">
                          User {i}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          Message preview...
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-800">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-1 hover:bg-gray-800 rounded-full transition"
                  >
                    <ChevronUp size={20} className="text-gray-400" />
                  </button>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${selectedUser}`}
                    alt="user"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">User {selectedUser}</p>
                    <p className="text-gray-400 text-xs">Active now</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsMessagesOpen(false);
                      setSelectedUser(null);
                    }}
                    className="p-1 hover:bg-gray-800 rounded-full transition"
                  >
                    <X size={18} className="text-gray-400 hover:text-white" />
                  </button>
                </div>

                {/* Chat Messages - Static Compact */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-64">
                  {(messages[selectedUser] || []).slice(-10).map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div className="flex items-end gap-1 max-w-xs">
                        {msg.sender === 'other' && (
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${selectedUser}`}
                            alt="user"
                            className="w-5 h-5 rounded-full flex-shrink-0"
                          />
                        )}
                        <div className="relative">
                          {msg.media ? (
                            <div
                              className={`rounded-lg overflow-hidden relative ${
                                msg.sender === 'user' ? 'rounded-br-none' : 'rounded-bl-none'
                              }`}
                            >
                              {msg.media.type === 'image' ? (
                                <img
                                  src={msg.media.url}
                                  alt="sent"
                                  className={`rounded-lg object-cover ${
                                    msg.sender === 'user' ? 'rounded-br-none' : 'rounded-bl-none'
                                  } ${
                                    mediaAspectRatio === 'landscape'
                                      ? 'w-[180px] h-[100px]'
                                      : mediaAspectRatio === 'portrait'
                                        ? 'w-[90px] h-[180px]'
                                        : 'w-[140px] h-[140px]'
                                  }`}
                                />
                              ) : (
                                <video
                                  src={msg.media.url}
                                  className={`rounded-lg object-cover ${
                                    msg.sender === 'user' ? 'rounded-br-none' : 'rounded-bl-none'
                                  } ${
                                    mediaAspectRatio === 'landscape'
                                      ? 'w-[180px] h-[100px]'
                                      : mediaAspectRatio === 'portrait'
                                        ? 'w-[90px] h-[180px]'
                                        : 'w-[140px] h-[140px]'
                                  }`}
                                  controls
                                />
                              )}
                              {/* 3-dot Menu - Only for other user's messages */}
                              {msg.sender === 'other' && (
                              <div className="absolute top-1 right-1">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === msg.id ? null : msg.id);
                                  }}
                                  className="p-1 bg-black/50 hover:bg-black/70 rounded-full transition"
                                >
                                  <MoreHorizontal size={14} className="text-white" />
                                </motion.button>

                                {/* Dropdown Menu */}
                                {openMenuId === msg.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-6 right-0 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden z-50 w-40 shadow-lg"
                                  >
                                    <button
                                      onClick={() => {
                                        deleteMessage(msg.id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition"
                                    >
                                      <Trash2 size={14} />
                                      <span>Delete</span>
                                    </button>
                                    <div className="border-t border-gray-700" />
                                    <button
                                      onClick={() => setOpenMenuId(null)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:bg-gray-700/50 transition"
                                    >
                                      <span>Report</span>
                                    </button>
                                    <div className="border-t border-gray-700" />
                                    <button
                                      onClick={() => setOpenMenuId(null)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:bg-gray-700/50 transition"
                                    >
                                      <span>Pin</span>
                                    </button>
                                  </motion.div>
                                )}
                              </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`px-3 py-2 rounded text-xs relative group ${
                                msg.sender === 'user'
                                  ? 'bg-purple-600 text-white rounded-br-none'
                                  : 'bg-gray-800 text-gray-200 rounded-bl-none'
                              }`}
                            >
                              {msg.text}
                              {/* 3-dot Menu for text messages - Only for other user's messages */}
                              {msg.sender === 'other' && (
                                <div className="absolute top-1 right-1 hidden group-hover:block">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(openMenuId === msg.id ? null : msg.id);
                                    }}
                                    className="p-0.5 bg-black/30 hover:bg-black/50 rounded-full transition"
                                  >
                                    <MoreHorizontal size={12} className="text-gray-300" />
                                  </motion.button>

                                  {/* Dropdown Menu */}
                                  {openMenuId === msg.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                      transition={{ duration: 0.2 }}
                                      className="absolute top-4 right-0 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden z-50 w-40 shadow-lg"
                                    >
                                      <button
                                        onClick={() => {
                                          deleteMessage(msg.id);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition"
                                      >
                                        <Trash2 size={14} />
                                        <span>Delete</span>
                                      </button>
                                      <div className="border-t border-gray-700" />
                                      <button
                                        onClick={() => setOpenMenuId(null)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:bg-gray-700/50 transition"
                                      >
                                        <span>Report</span>
                                      </button>
                                      <div className="border-t border-gray-700" />
                                      <button
                                        onClick={() => setOpenMenuId(null)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:bg-gray-700/50 transition"
                                      >
                                        <span>Pin</span>
                                      </button>
                                    </motion.div>
                                  )}
                                </div>
                              )}
                            </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${selectedUser}`}
                        alt="user"
                        className="w-5 h-5 rounded-full"
                      />
                      <div className="flex gap-1 bg-gray-800 px-2 py-1 rounded">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                              duration: 0.6,
                              delay: i * 0.1,
                              repeat: Infinity,
                            }}
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex flex-col border-t border-gray-800">
                  {/* Emoji Picker */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-4 gap-1 p-2 bg-gray-800 border-b border-gray-700"
                      >
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="text-lg hover:bg-gray-700 p-1 rounded transition"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input Bar */}
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-1 p-2"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1.5 hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-white"
                    >
                      <Smile size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-white"
                    >
                      <Paperclip size={18} />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onFocus={() => setShowEmojiPicker(false)}
                      placeholder="Message..."
                      className="flex-1 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Toggle Button - When Closed */}
      <AnimatePresence>
        {!isMessagesOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsMessagesOpen(true)}
            className="fixed bottom-8 right-8 bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition z-40 hidden lg:flex items-center justify-center text-white hover:scale-110"
          >
            <MessageCircle size={24} />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold"
            >
              4
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reels;
