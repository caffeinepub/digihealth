import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, HelpCircle, LogOut, Search, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import MyRecords from "./components/MyRecords";
import ProfileSetupModal from "./components/ProfileSetupModal";
import SharedRecordsViewer from "./components/SharedRecordsViewer";
import SharingPanel from "./components/SharingPanel";
import UploadModal from "./components/UploadModal";
import WellnessTab from "./components/WellnessTab";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useRecords } from "./hooks/useRecords";

type Tab = "dashboard" | "records" | "appointments" | "wellness" | "support";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "records", label: "My Records" },
  { id: "appointments", label: "Appointments" },
  { id: "wellness", label: "Wellness" },
  { id: "support", label: "Support" },
];

const USER_NAME_KEY = "digihealth_user_name";

export default function App() {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === "logging-in";

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(USER_NAME_KEY) || "";
  });
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const { records, addRecord, deleteRecord, archiveRecord, detectCategory } =
    useRecords();

  const shareToken = new URLSearchParams(window.location.search).get("share");

  useEffect(() => {
    if (isAuthenticated && !userName) {
      setShowProfileSetup(true);
    }
  }, [isAuthenticated, userName]);

  const handleProfileSave = (name: string) => {
    setUserName(name);
    localStorage.setItem(USER_NAME_KEY, name);
    setShowProfileSetup(false);
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (shareToken) {
    return (
      <>
        <Toaster />
        <SharedRecordsViewer
          token={shareToken}
          allRecords={records}
          patientName={localStorage.getItem(USER_NAME_KEY) || "Patient"}
        />
      </>
    );
  }

  if (!isAuthenticated && !isInitializing) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  const displayName = userName || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster />

      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <img
                src="/assets/generated/digihealth-logo-transparent.dim_48x48.png"
                alt="DigiHealth"
                className="w-8 h-8"
              />
              <span className="text-lg font-bold text-foreground">
                DigiHealth
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1 ml-4">
              {TABS.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-ocid={`nav.${tab.id === "dashboard" ? "primary_button" : "link"}`}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
                    activeTab === tab.id
                      ? "text-teal"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal rounded-full"
                    />
                  )}
                </button>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search records, dates, providers…"
                  className="pl-8 h-9 w-56 rounded-full text-sm"
                  data-ocid="header.search_input"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground"
                data-ocid="header.secondary_button"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground"
                data-ocid="header.secondary_button"
              >
                <Bell className="w-4.5 h-4.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    data-ocid="header.toggle"
                  >
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarFallback className="bg-teal text-white text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="font-medium text-foreground">
                    <User className="w-4 h-4 mr-2" />
                    {displayName}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                    data-ocid="header.delete_button"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard
                records={records}
                userName={displayName}
                onUpload={() => setUploadOpen(true)}
                onShare={() => setActiveTab("appointments")}
                onViewRecords={() => setActiveTab("records")}
              />
            </motion.div>
          )}

          {activeTab === "records" && (
            <motion.div
              key="records"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MyRecords
                records={records}
                onUpload={() => setUploadOpen(true)}
                onDelete={deleteRecord}
                onArchive={archiveRecord}
              />
            </motion.div>
          )}

          {activeTab === "appointments" && (
            <motion.div
              key="sharing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SharingPanel records={records} userName={displayName} />
            </motion.div>
          )}

          {activeTab === "wellness" && (
            <motion.div
              key="wellness"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <WellnessTab />
            </motion.div>
          )}

          {activeTab === "support" && (
            <motion.div
              key="support"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Support
              </h2>
              <p className="text-muted-foreground max-w-sm">
                24/7 patient support and help centre coming soon.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-border bg-white py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/digihealth-logo-transparent.dim_48x48.png"
              alt=""
              className="w-5 h-5 opacity-60"
            />
            <span>
              © {new Date().getFullYear()} DigiHealth. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onAdd={addRecord}
        detectCategory={detectCategory}
      />

      <ProfileSetupModal open={showProfileSetup} onSave={handleProfileSave} />
    </div>
  );
}
