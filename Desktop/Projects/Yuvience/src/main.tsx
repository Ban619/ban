@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 15% 6%;
    --foreground: 240 10% 95%;

    --card: 240 12% 10%;
    --card-foreground: 240 10% 95%;

    --popover: 240 12% 8%;
    --popover-foreground: 240 10% 95%;

    --primary: 265 80% 55%;
    --primary-foreground: 0 0% 100%;

    --secondary: 225 70% 25%;
    --secondary-foreground: 240 10% 95%;

    --muted: 240 10% 16%;
    --muted-foreground: 240 8% 55%;

    --accent: 225 85% 45%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    --border: 240 10% 18%;
    --input: 240 10% 18%;
    --ring: 265 80% 55%;

    --radius: 0.75rem;

    /* Custom Yutende Colors */
    --deep-purple: 265 85% 12%;
    --vivid-purple: 265 80% 55%;
    --electric-blue: 225 85% 50%;
    --midnight: 240 20% 4%;
    --slate-dark: 240 12% 14%;
    --glow-purple: 265 100% 70%;
    --glow-blue: 225 100% 65%;

    /* Gradients */
    --gradient-primary: linear-gradient(135deg, hsl(265 80% 55%) 0%, hsl(225 85% 50%) 100%);
    --gradient-dark: linear-gradient(180deg, hsl(240 15% 6%) 0%, hsl(265 85% 12%) 100%);
    --gradient-card: linear-gradient(145deg, hsl(240 12% 12%) 0%, hsl(240 12% 8%) 100%);
    --gradient-glow: linear-gradient(135deg, hsl(265 100% 70% / 0.2) 0%, hsl(225 100% 65% / 0.2) 100%);

    /* Shadows */
    --shadow-glow: 0 0 40px hsl(265 80% 55% / 0.3);
    --shadow-card: 0 8px 32px hsl(0 0% 0% / 0.3);
    --shadow-elevated: 0 20px 60px hsl(0 0% 0% / 0.4);

    --sidebar-background: 240 15% 8%;
    --sidebar-foreground: 240 10% 95%;
    --sidebar-primary: 265 80% 55%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 225 70% 25%;
    --sidebar-accent-foreground: 240 10% 95%;
    --sidebar-border: 240 10% 18%;
    --sidebar-ring: 265 80% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-family: 'Inter', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Space Grotesk', sans-serif;
  }
}

@layer components {
  .glass-card {
    @apply bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl;
    box-shadow: var(--shadow-card);
  }

  .glass-card-hover {
    @apply glass-card transition-all duration-300;
  }

  .glass-card-hover:hover {
    @apply border-primary/50;
    box-shadow: var(--shadow-glow);
    transform: translateY(-2px);
  }

  .gradient-text {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .gradient-border {
    position: relative;
  }

  .gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 1px;
    border-radius: inherit;
    background: var(--gradient-primary);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  .glow-effect {
    box-shadow: var(--shadow-glow);
  }

  .btn-primary {
    @apply px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300;
    background: var(--gradient-primary);
  }

  .btn-primary:hover {
    box-shadow: var(--shadow-glow);
    transform: translateY(-2px);
  }

  .sidebar-gradient {
    background: linear-gradient(180deg, hsl(240 15% 8%) 0%, hsl(265 85% 8%) 100%);
  }

  .input-dark {
    @apply bg-muted/50 border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200;
  }

  .feature-icon {
    @apply w-12 h-12 rounded-xl flex items-center justify-center;
    background: var(--gradient-primary);
    box-shadow: 0 4px 20px hsl(265 80% 55% / 0.3);
  }

  .nav-link {
    @apply flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200;
  }

  .nav-link.active {
    @apply text-foreground bg-muted/50;
    border-left: 3px solid hsl(var(--primary));
  }

  .stat-card {
    @apply glass-card p-6;
    background: var(--gradient-card);
  }

  .table-row {
    @apply border-b border-border/30 hover:bg-muted/30 transition-colors duration-200;
  }

  .chart-container {
    @apply glass-card p-6;
    background: var(--gradient-card);
  }

  .particle {
    @apply absolute rounded-full;
    background: var(--gradient-primary);
    opacity: 0.3;
    filter: blur(1px);
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: hsl(var(--muted));
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: hsl(var(--primary) / 0.5);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--primary) / 0.7);
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-pulse-slow {
    animation: pulse 4s ease-in-out infinite;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite alternate;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes glow {
    from {
      box-shadow: 0 0 20px hsl(265 80% 55% / 0.3);
    }
    to {
      box-shadow: 0 0 40px hsl(265 80% 55% / 0.5);
    }
  }
}
