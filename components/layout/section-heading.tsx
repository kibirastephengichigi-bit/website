import { Badge } from "@/components/ui/badge";

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl space-y-5">
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <div className="space-y-4">
        <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="text-lg leading-8 text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
