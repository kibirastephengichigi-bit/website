import { AnimatedStat } from "@/components/home/animated-stat";
import { useState, useEffect } from "react";

export function StatisticsSection() {
  const [stats, setStats] = useState<Array<{ value: number; suffix: string; label: string }>>([
    { value: 15, suffix: "+", label: "Years of Experience" },
    { value: 50, suffix: "+", label: "Publications" },
    { value: 1000, suffix: "+", label: "People Helped" },
    { value: 25, suffix: "+", label: "Research Projects" },
  ]);

  useEffect(() => {
    fetch("/api/statistics")
      .then(res => res.json())
      .then(data => {
        if (data.statistics && data.statistics.length > 0) {
          setStats(data.statistics.map((stat: any) => ({
            value: stat.value,
            suffix: stat.suffix || "",
            label: stat.label
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-accent/5 via-background to-accent/5">
      <div className="container-shell">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl mb-4">Impact & Experience</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Years of dedicated service in psychology, research, and academic leadership
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 font-display text-4xl font-bold text-accent">
                <AnimatedStat value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
