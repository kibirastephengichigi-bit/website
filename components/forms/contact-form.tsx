"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/validators/contact";

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactValues) => {
    setStatus("idle");

    // Basic rate limiting (client-side)
    const lastSubmission = localStorage.getItem("contact-form-last-submit");
    if (lastSubmission) {
      const timeDiff = Date.now() - parseInt(lastSubmission);
      if (timeDiff < 60000) { // 1 minute cooldown
        setStatus("error");
        return;
      }
    }

    try {
      const response = await fetch("/api/contact", {
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
      localStorage.setItem("contact-form-last-submit", Date.now().toString());

      form.reset();
      setStatus("success");
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          placeholder="Your name"
          {...form.register("name")}
          disabled={form.formState.isSubmitting}
          maxLength={100}
        />
        <Input
          type="email"
          placeholder="Your email"
          {...form.register("email")}
          disabled={form.formState.isSubmitting}
          maxLength={254}
        />
      </div>
      <Textarea
        placeholder="How can we support you?"
        {...form.register("message")}
        disabled={form.formState.isSubmitting}
        maxLength={2000}
        rows={5}
      />

      {/* Hidden CSRF token */}
      <input
        type="hidden"
        name="csrf_token"
        value={generateCSRFToken()}
      />

      {status === "success" ? (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Your message has been sent. We are on it.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          We could not send your message right now. Please try again later or contact us directly.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="min-w-[180px]"
          aria-busy={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending message...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
        {form.formState.isSubmitting ? (
          <p className="text-sm text-muted-foreground">Submitting your message now. Please wait.</p>
        ) : null}
      </div>
    </form>
  );
}

// Simple CSRF token generation (client-side)
function generateCSRFToken(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return btoa(timestamp + random).substring(0, 32);
}
