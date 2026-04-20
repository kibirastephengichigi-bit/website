"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSchema } from "@/lib/validators/contact";

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const form = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: NewsletterValues) => {
    setStatus("idle");

    // Basic rate limiting (client-side)
    const lastSubmission = localStorage.getItem("newsletter-form-last-submit");
    if (lastSubmission) {
      const timeDiff = Date.now() - parseInt(lastSubmission);
      if (timeDiff < 300000) { // 5 minute cooldown
        setStatus("error");
        return;
      }
    }

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add CSRF protection header
          "X-CSRF-Token": generateCSRFToken(),
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      // Store submission timestamp for rate limiting
      localStorage.setItem("newsletter-form-last-submit", Date.now().toString());

      form.reset();
      setStatus("success");
    } catch (error) {
      console.error("Newsletter form error:", error);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          placeholder="Enter your email"
          {...form.register("email")}
          className="h-12 bg-white"
          disabled={form.formState.isSubmitting}
          maxLength={254}
        />
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="min-w-[190px]"
          aria-busy={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            "Join Newsletter"
          )}
        </Button>
      </div>

      {/* Hidden CSRF token */}
      <input
        type="hidden"
        name="csrf_token"
        value={generateCSRFToken()}
      />

      {/* Honeypot field for bot detection */}
      <input
        type="text"
<<<<<<< HEAD
=======
        name="website"
>>>>>>> 2b901905c51a30f2ce2812606eaa2bc859199a5e
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        {...form.register("website")}
      />

      {form.formState.isSubmitting ? (
        <p className="text-sm text-white/80">Adding your email now. Please wait a moment.</p>
      ) : null}

      {status === "success" ? (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200/70 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          You have been added successfully.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-2xl border border-red-200/70 bg-red-50/95 px-4 py-3 text-sm text-red-700">
          We could not complete your signup. Please try again later.
        </div>
      ) : null}
    </form>
  );
}

// Simple CSRF token generation (client-side)
function generateCSRFToken(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return btoa(timestamp + random).substring(0, 32);
}
