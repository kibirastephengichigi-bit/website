import { Card } from "@/components/ui/card";

export function ResourceList({
  title,
  items,
}: {
  title: string;
  items: Array<Record<string, string | number | boolean | undefined>>;
}) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="font-display text-3xl">{title}</h2>
        <div className="overflow-hidden rounded-3xl border border-border">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <tbody className="divide-y divide-border bg-white">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 font-medium">{String(item.title || item.name || item.label || item.slug || `Item ${index + 1}`)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {Object.values(item)
                      .filter(Boolean)
                      .slice(1, 3)
                      .map((value) => String(value))
                      .join(" • ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
