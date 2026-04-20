import { createMetadata } from "@/lib/site";

export const metadata = createMetadata(
  "Privacy and Cookies",
  "How sign-in cookies, preference cookies, and privacy choices work on the site.",
  "/privacy-cookies",
);

export default function PrivacyCookiesPage() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-8 max-w-4xl">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Privacy</p>
          <h1 className="font-display text-5xl">Privacy and Cookies</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            We use a small number of cookies to support login, preferences, and optional analytics. Your Google account
            profile is stored in the database so we can keep your session and account settings in sync.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-border bg-white p-6">
            <h2 className="font-display text-3xl">Essential cookies</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>Session cookies for sign-in.</li>
              <li>`site_cookie_consent` to remember your consent choice.</li>
              <li>`site_cookie_preferences` for cookie category selection.</li>
            </ul>
          </div>
          <div className="rounded-[28px] border border-border bg-white p-6">
            <h2 className="font-display text-3xl">Optional cookies</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>Analytics cookies, if you allow them.</li>
              <li>Preference cookies for future personalization.</li>
              <li>Marketing cookies, if we later add campaigns or remarketing.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

