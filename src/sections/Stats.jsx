import AnimatedCounter from "@/components/motion/AnimatedCounter";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { useT } from "@/hooks/useI18n";

export default function Stats() {
  const t = useT();
  const stats = [
    { value: 7, suffix: "", label: t("stats.stages"), decimals: 0 },
    { value: 6, suffix: "", label: t("stats.formats"), decimals: 0 },
    { value: 60, suffix: "s", label: t("stats.preview"), decimals: 0 },
    { value: 300, suffix: "K", label: t("stats.polycount"), decimals: 0 },
  ];

  return (
    <section className="relative px-6 py-10">
      <StaggerGroup className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <div className="glass rounded-2xl p-6 text-center transition-transform duration-300 hover:-translate-y-1">
              <div className="font-display text-4xl font-bold text-app-text">
                <AnimatedCounter
                  value={s.value}
                  suffix={s.suffix}
                  decimals={s.decimals}
                />
              </div>
              <div className="mt-1.5 text-sm text-app-muted">{s.label}</div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
