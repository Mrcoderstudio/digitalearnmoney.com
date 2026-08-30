import Link from "next/link";

interface LogoProps {
  light?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ light = false, size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: "h-8 w-8", text: "text-sm", tagline: "text-[6px]" },
    md: { icon: "h-10 w-10", text: "text-base", tagline: "text-[7px]" },
    lg: { icon: "h-12 w-12", text: "text-xl", tagline: "text-[9px]" },
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <Link href="/" className="flex items-center gap-2 group">
      {/* Logo Icon (Letter "D" for Digital) */}
      <div className="relative h-10 w-10 flex-shrink-0">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FFD700] to-[#00D4FF] blur-xl opacity-40 animate-pulse" />
        <div className={`relative flex ${sizeClass.icon} items-center justify-center rounded-full bg-gradient-to-r from-[#FFD700] to-[#00D4FF] shadow-lg`}>
          <span className={`${size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"} font-black text-[#0a1628]`}>
            D
          </span>
        </div>
      </div>

      {/* Logo Text */}
      <div className="flex flex-col leading-none">
        <span className={`${sizeClass.text} font-extrabold tracking-tight ${light ? "text-white" : "text-white"}`}>
          Digital Earn <span className="text-gradient">Money</span>
        </span>
        <span className={`${sizeClass.tagline} font-medium tracking-[0.2em] text-gray-400 uppercase`}>
          Invest Smart, Earn Daily
        </span>
      </div>
    </Link>
  );
}