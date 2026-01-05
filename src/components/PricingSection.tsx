"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  disabled?: boolean;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Perfect for getting started",
    features: [
      "5 AI consultations per month",
      "Basic voice notes",
      "Standard dental templates",
      "Email support",
      "Basic appointment scheduling",
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline",
    disabled: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For comprehensive dental care",
    features: [
      "Unlimited AI consultations",
      "Advanced voice transcription",
      "Custom dental templates",
      "Priority 24/7 support",
      "Advanced analytics dashboard",
      "Team collaboration tools",
      "Export reports & records",
      "Mobile app access",
    ],
    popular: true,
    buttonText: "Upgrade to Pro",
    buttonVariant: "default",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For dental clinics & practices",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Dedicated account manager",
      "Custom AI model training",
      "Advanced security & compliance",
      "API access",
      "Custom integrations",
      "SLA guarantee",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  },
];

export default function PricingSection() {
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    // Don't do anything for Free plan
    if (planName === "Free") return;

    // Handle Enterprise plan
    if (planName === "Enterprise") {
      setActiveButton(planName);
      toast.success("Contacting Sales", {
        description: "Opening your email client...",
      });
      setTimeout(() => {
        window.location.href = "mailto:sales@dentwise.com";
        setActiveButton(null);
      }, 1000);
      return;
    }

    // Handle Pro plan - Stripe checkout
    setLoading(true);
    setActiveButton(planName);
    toast.loading("Redirecting to checkout...", { id: "checkout" });

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        toast.error(data.error, { id: "checkout" });
        setLoading(false);
        setActiveButton(null);
        return;
      }

      if (data.url) {
        toast.success("Redirecting to Stripe...", { id: "checkout" });
        // Redirect to Stripe Checkout
        window.location.href = data.url;
        // Keep loading state true since we're redirecting
      } else {
        toast.error("No checkout URL received", { id: "checkout" });
        setLoading(false);
        setActiveButton(null);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to create checkout session. Please try again.", {
        id: "checkout",
      });
      setLoading(false);
      setActiveButton(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`relative flex flex-col transition-all duration-200 ${
            plan.popular
              ? "border-primary shadow-xl scale-105 bg-gradient-to-b from-primary/5 to-background"
              : "border-border hover:shadow-lg"
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4" />
                Most Popular
              </div>
            </div>
          )}

          <CardHeader className="pb-8">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription className="text-base">
              {plan.description}
            </CardDescription>
            <div className="mt-6">
              <span className="text-5xl font-bold tracking-tight">
                {plan.price}
              </span>
              <span className="text-muted-foreground text-lg ml-1">
                {plan.period}
              </span>
            </div>
          </CardHeader>

          <CardContent className="flex-1">
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                    <CheckIcon className="w-4 h-4 text-primary shrink-0" />
                  </div>
                  <span className="text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="pt-8">
            <Button
              className="w-full h-11 text-base font-semibold"
              variant={plan.buttonVariant}
              onClick={() => handleSubscribe(plan.name)}
              disabled={plan.disabled || (loading && activeButton === plan.name)}
            >
              {loading && activeButton === plan.name ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                plan.buttonText
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}