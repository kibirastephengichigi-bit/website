export function StatisticsSection() {
  const stats = [
    { value: 15, suffix: "+", label: "Years of Experience" },
    { value: 50, suffix: "+", label: "Publications" },
    { value: 1000, suffix: "+", label: "People Helped" },
    { value: 25, suffix: "+", label: "Research Projects" },
  ];

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
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-2 font-display text-4xl font-bold text-accent">
                {stat.value}
                {stat.suffix}
              </div>
              <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
