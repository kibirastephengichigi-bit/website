"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSchema } from "@/lib/validators/contact";

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const form = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: NewsletterValues) => {
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        placeholder="Enter your email"
        {...form.register("email")}
        className="h-12 bg-white"
      />
      <Button type="submit" size="lg">
        Join Newsletter
      </Button>
    </form>
  );
}
