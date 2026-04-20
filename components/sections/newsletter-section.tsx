import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Card } from "@/components/ui/card";

export function NewsletterSection() {
  return (
    <section className="section-space">
      <div className="container-shell">
        <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(15,23,42,1),rgba(21,128,99,0.88))] p-8 text-white sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Newsletter</p>
              <h2 className="font-display text-4xl sm:text-5xl">
                Insights on mental health, African psychology, research, and human development.
              </h2>
              <p className="max-w-2xl text-white/80">
                A modern mailing list section is included so future thought leadership can be published beyond the blog itself.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </Card>
      </div>
    </section>
  );
}
