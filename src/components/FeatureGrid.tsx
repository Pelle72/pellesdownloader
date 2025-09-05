import { Music, Video, Smartphone, Zap, Shield, Download } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "HD Video Downloads",
    description: "Download videos in high quality from YouTube and TikTok"
  },
  {
    icon: Music,
    title: "Audio Extraction",
    description: "Extract and save audio as MP3 files"
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Perfect experience on all devices"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Quick downloads with optimized processing"
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "No data stored, completely private"
  },
  {
    icon: Download,
    title: "Batch Downloads",
    description: "Download multiple videos efficiently"
  }
];

export const FeatureGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {features.map((feature, index) => (
        <div
          key={index}
          className="group bg-gradient-card border border-border/50 rounded-lg p-6 hover:shadow-card transition-all duration-300 hover:border-primary/30"
        >
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
            <feature.icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {feature.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};