import Image from "next/image";

import {
  Users,
  Eye,
  Trophy,
  GraduationCap,
  Target,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react";
import { FaYoutube, FaInstagram, FaFacebook } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const STATS = [
  { icon: Users, value: "5,000+", label: "Students Enrolled" },
  { icon: Eye, value: "4M+", label: "YouTube Views" },
  { icon: Trophy, value: "1,000+", label: "Drivers Coached" },
];

const SERVICES = [
  {
    icon: Target,
    title: "1-on-1 Coaching",
    description:
      "Personal sessions with elite coaches who analyze your driving and build a custom improvement plan.",
    features: [
      "Personalized feedback",
      "Race strategy analysis",
      "Tailored training plans",
    ],
  },
  {
    icon: GraduationCap,
    title: "Online Courses",
    description:
      "Structured GT3, Formula, and Foundations courses to systematically improve your pace.",
    features: [
      "GT3 Masterclass",
      "Formula Driving Course",
      "Racing Foundations",
    ],
  },
  {
    icon: BookOpen,
    title: "Free Training Resources",
    description:
      "Start improving today with free tutorials, guides, and community resources.",
    features: ["Video tutorials", "Setup guides", "Community Discord"],
  },
];

const PARTNERS = ["iRacing", "SimLab", "GoSetups"];

const SOCIALS = [
  {
    icon: FaYoutube,
    label: "YouTube",
    href: "https://www.youtube.com/@GitGudRacing",
    description: "Tutorials, race breakdowns, and coaching highlights",
  },
  {
    icon: FaInstagram,
    label: "Instagram",
    href: "https://www.instagram.com/gitgudracing/",
    description: "Behind the scenes and community highlights",
  },
  {
    icon: FaFacebook,
    label: "Facebook",
    href: "https://www.facebook.com/people/Gitgud-Racing/61581765969322/",
    description: "News, updates, and community discussion",
  },
];

export default function HomePageView() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="flex min-h-[65vh] items-center justify-center px-4">
        <div className="bg-muted/20 mx-auto max-w-4xl rounded-2xl p-8 text-center backdrop-blur-sm md:p-12">
          <Image
            src="/gitgud.png"
            alt="GitGud Racing"
            width={144}
            height={144}
            className="mx-auto mb-2 h-28 w-28 rounded-full md:h-52 md:w-52"
            priority
          />

          <div className="from-primary to-secondary mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r" />

          <h1 className="text-foreground mb-4 text-4xl font-semibold tracking-tight md:text-6xl">
            GET FASTER, THE SMART WAY
          </h1>

          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg md:text-xl">
            Elite Coaching & Sim Racing Courses for Drivers Who Want to Win
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <a
                href="https://gitgudracing.com/free-training/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Start Your Free Training
                <ChevronRight className="ml-1 size-4" />
              </a>
            </Button>

            <Button asChild variant="outline" size="lg">
              <a
                href="https://gitgudracing.com/iracingcarscourses/"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Courses
                <ExternalLink className="ml-1 size-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Racing Stripe + Motto */}
      <div className="from-primary via-secondary to-primary h-1 w-full bg-gradient-to-r" />
      <section className="bg-background/90 px-4 py-8 backdrop-blur-sm">
        <p className="text-foreground text-center text-lg font-semibold tracking-wide italic md:text-xl">
          Train Like the Best. Race Like the Best. Win Like the Best.
        </p>
      </section>
      <div className="from-primary via-secondary to-primary h-1 w-full bg-gradient-to-r" />

      {/* Services Section */}
      <section className="bg-background/90 px-4 py-16 backdrop-blur-sm md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
              What We Offer
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Structured coaching and courses designed to make you faster
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SERVICES.map((service) => (
              <Card
                key={service.title}
                className="border-primary/20 hover:border-primary/40 overflow-hidden transition-colors"
              >
                <div className="from-primary to-secondary h-1 bg-gradient-to-r" />
                <CardHeader>
                  <service.icon className="text-primary mb-2 size-10" />
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-muted-foreground flex items-center gap-2 text-sm"
                      >
                        <ChevronRight className="text-secondary size-4 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-card/90 px-4 py-16 backdrop-blur-sm md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
              Trusted by Thousands of Drivers
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-3 text-center"
              >
                <stat.icon className="text-primary size-8" />
                <p className="text-foreground text-4xl font-bold md:text-5xl">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-12" />

          <div className="text-center">
            <p className="text-muted-foreground mb-6 text-sm font-medium tracking-wider uppercase">
              Partnered With
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {PARTNERS.map((partner) => (
                <span
                  key={partner}
                  className="bg-muted text-foreground rounded-lg px-5 py-2.5 text-sm font-semibold"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Socials Section */}
      <section className="bg-background/90 px-4 py-16 backdrop-blur-sm md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
              Follow the Journey
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Free content, community highlights, and the latest from GitGud
              Racing
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border hover:border-primary/40 bg-card/80 group flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-colors"
              >
                <social.icon className="text-primary size-10 transition-transform group-hover:scale-110" />
                <p className="text-foreground text-lg font-semibold">
                  {social.label}
                </p>
                <p className="text-muted-foreground text-sm">
                  {social.description}
                </p>
                <span className="text-primary mt-1 flex items-center gap-1 text-sm font-medium">
                  Visit <ExternalLink className="size-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="border-primary/30 bg-card/90 mx-auto max-w-3xl rounded-2xl border p-8 text-center backdrop-blur-sm md:p-12">
          <div className="from-primary to-secondary mx-auto mb-8 h-1 w-24 rounded-full bg-gradient-to-r" />
          <Zap className="text-primary mx-auto mb-4 size-10" />

          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Ready to Get Faster?
          </h2>

          <p className="text-muted-foreground mx-auto mb-8 max-w-xl text-lg">
            Join thousands of drivers who are training smarter with structured
            coaching and proven methods.
          </p>

          <Button asChild size="lg">
            <a
              href="https://gitgudracing.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start Your Free Training
              <ChevronRight className="ml-1 size-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/90 px-4 py-8 backdrop-blur-sm">
        <Separator className="mb-6" />
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            GitGud Racing &middot; {new Date().getFullYear()}
          </p>
          <a
            href="https://gitgudracing.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary mt-1 inline-flex items-center gap-1 text-sm hover:underline"
          >
            gitgudracing.com
            <ExternalLink className="size-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
