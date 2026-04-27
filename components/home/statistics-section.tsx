"use client";

import { AnimatedStat } from "@/components/home/animated-stat";
import { useState, useEffect, useRef } from "react";
import { TrendingUp, Award, Users, BookOpen, Target } from "lucide-react";

const iconMap: Record<string, any> = {
  TrendingUp,
  Award,
  Users,
  BookOpen,
  Target
};

export function StatisticsSection() {
  const [stats, setStats] = useState<Array<{ value: number; suffix: string; label: string; icon?: string }>>([
    { value: 15, suffix: "+", label: "Years of Experience" },
    { value: 50, suffix: "+", label: "Publications" },
    { value: 1000, suffix: "+", label: "People Helped" },
    { value: 25, suffix: "+", label: "Research Projects" },
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    fetch("/api/statistics", { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        if (data.statistics && data.statistics.length > 0) {
          setStats(data.statistics.map((stat: any) => ({
            value: stat.value,
            suffix: stat.suffix || "",
            label: stat.label,
            icon: stat.icon
          })));
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container-shell relative z-10">
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Impact & Experience
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Years of dedicated service in psychology, research, and academic leadership
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, index }: { stat: any; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
    }, 100 + index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const Icon = stat.icon ? iconMap[stat.icon] : TrendingUp;

  return (
    <div
      ref={cardRef}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative bg-white rounded-2xl p-6 shadow-lg
          transition-all duration-500 ease-out
          ${isHovered ? 'transform scale-105 shadow-2xl' : 'transform scale-100'}
          hover:border-blue-300 border border-slate-100
        `}
        style={{
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        }}
      >
        {/* Circular progress ring */}
        <svg className="absolute -top-2 -right-2 w-16 h-16 transform rotate-[-90deg]">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="#e2e8f0"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="url(#gradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={175.93}
            strokeDashoffset={175.93 - (175.93 * progress) / 100}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Icon */}
        <div
          className={`
            w-14 h-14 rounded-xl flex items-center justify-center mb-4
            bg-gradient-to-br from-blue-500 to-indigo-600
            transition-all duration-300
            ${isHovered ? 'scale-110 rotate-6' : 'scale-100 rotate-0'}
          `}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Value */}
        <div className="mb-2">
          <div className="font-display text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            <AnimatedStat value={stat.value} suffix={stat.suffix} />
          </div>
        </div>

        {/* Label */}
        <div className="text-sm font-medium text-slate-600">{stat.label}</div>

        {/* Hover glow effect */}
        <div
          className={`
            absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10
            transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        />

        {/* Milestone badge */}
        {stat.value >= 1000 && (
          <div className="absolute -top-3 -left-3">
            <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              🏆 Milestone
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
