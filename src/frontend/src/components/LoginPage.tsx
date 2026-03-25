import { Button } from "@/components/ui/button";
import { Brain, Shield, Smartphone, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.962_0.025_186)] to-[oklch(0.96_0.015_200)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center gap-3">
        <img
          src="/assets/generated/digihealth-logo-transparent.dim_48x48.png"
          alt="DigiHealth"
          className="w-9 h-9"
        />
        <span className="text-xl font-bold text-foreground">DigiHealth</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              Your Digital <span className="text-teal">Health Hub</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              One secure place for all your medical records. Upload, organise
              with AI, and share with your providers in seconds.
            </p>
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="login.primary_button"
              className="bg-navy hover:bg-navy/90 text-white px-8 py-3 text-base h-auto rounded-xl"
            >
              {isLoggingIn ? "Connecting…" : "Get Started — Log In"}
            </Button>
          </motion.div>

          {/* Right: feature cards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              {
                icon: Zap,
                title: "Quick Upload",
                desc: "Drag-and-drop PDF, images, or scans in seconds",
                color: "bg-yellow-50 text-yellow-600",
              },
              {
                icon: Brain,
                title: "AI Sorting",
                desc: "Smart categorisation of records automatically",
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: Smartphone,
                title: "Mobile Sharing",
                desc: "Share with providers via QR code or link",
                color: "bg-teal-50 text-teal-600",
              },
              {
                icon: Shield,
                title: "Always Secure",
                desc: "End-to-end encryption on the Internet Computer",
                color: "bg-blue-50 text-blue-600",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="bg-white rounded-xl p-5 shadow-card border border-border"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border bg-white">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="hover:text-teal transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
