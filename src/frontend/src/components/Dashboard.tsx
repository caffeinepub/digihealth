import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarPlus,
  Clock,
  FileText,
  Link2,
  QrCode,
  Settings,
  Share2,
  Smartphone,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import type { HealthRecord, RecordCategory } from "../types/records";
import { ALL_CATEGORIES, CATEGORY_ICONS } from "../types/records";
import CategoryBadge from "./CategoryBadge";
import StatusBadge from "./StatusBadge";

interface DashboardProps {
  records: HealthRecord[];
  userName: string;
  onUpload: () => void;
  onShare: () => void;
  onViewRecords: () => void;
}

function CategoryCard({
  category,
  records,
}: {
  category: RecordCategory;
  records: HealthRecord[];
}) {
  const cat = records.filter((r) => r.category === category);
  const latest = cat.sort((a, b) => b.date.localeCompare(a.date))[0];
  return (
    <Card className="border border-border shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-lg">
            {CATEGORY_ICONS[category]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{category}</p>
            <p className="text-xs text-muted-foreground">
              {cat.length} record{cat.length !== 1 ? "s" : ""}
            </p>
          </div>
          <span className="text-2xl font-bold text-teal">{cat.length}</span>
        </div>
        {latest ? (
          <p className="text-xs text-muted-foreground truncate">
            <span className="font-medium">Latest:</span> {latest.name}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No records yet</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard({
  records,
  userName,
  onUpload,
  onShare,
  onViewRecords,
}: DashboardProps) {
  const recentRecords = [...records]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const activeCount = records.filter((r) => r.status === "Active").length;
  const shareUrl = `${window.location.origin}?share=${btoa("dh-profile")}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="space-y-6">
      {/* Hero band */}
      <section
        className="rounded-2xl px-8 py-8 text-foreground"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.962 0.025 186), oklch(0.948 0.030 170))",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm font-medium text-[oklch(0.45_0.06_183)] mb-1">
            Welcome Back, {userName}!
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            Your Digital Health Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {records.length} records · {activeCount} active
          </p>
        </motion.div>
      </section>

      {/* At a Glance */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Card className="border border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              At a Glance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Recent Activity
                  </p>
                  {recentRecords[0] ? (
                    <>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {recentRecords[0].name}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {recentRecords[0].date} · {recentRecords[0].provider}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No records yet
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Document Count
                  </p>
                  <p className="text-3xl font-bold text-teal mt-0.5">
                    {records.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeCount} active records
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <Card className="border border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-navy hover:bg-navy/90 text-white"
                onClick={onUpload}
                data-ocid="dashboard.upload_button"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New Document
              </Button>
              <Button
                variant="outline"
                onClick={onUpload}
                data-ocid="dashboard.secondary_button"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Scan Document (Mobile)
              </Button>
              <Button
                variant="outline"
                onClick={onViewRecords}
                data-ocid="dashboard.secondary_button"
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
              <Button
                variant="outline"
                onClick={onShare}
                data-ocid="dashboard.share_button"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Share Profile via QR
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3-column content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Category cards */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Categories
          </h2>
          {ALL_CATEGORIES.map((cat) => (
            <CategoryCard key={cat} category={cat} records={records} />
          ))}
        </motion.div>

        {/* Center: Recent records table */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Card className="border border-border shadow-card h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Recent Health Records
                </CardTitle>
                <button
                  type="button"
                  className="text-xs text-teal hover:underline"
                  onClick={onViewRecords}
                  data-ocid="dashboard.link"
                >
                  View all
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRecords.map((rec, i) => (
                    <TableRow
                      key={rec.id}
                      data-ocid={`dashboard.item.${i + 1}`}
                    >
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate max-w-[130px]">
                              {rec.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[130px]">
                              {rec.provider}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {rec.date}
                      </TableCell>
                      <TableCell className="py-2">
                        <StatusBadge status={rec.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Insights sidebar */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Insights &amp; Actions
          </h2>

          {/* AI Smart Sorting card */}
          <Card className="border border-border shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-purple-600" />
                </div>
                <p className="font-semibold text-sm text-foreground">
                  AI Smart Sorting
                </p>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Automatically categorises your documents using AI keyword
                detection.
              </p>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Records sorted</span>
                <span className="font-medium text-foreground">
                  {records.length}
                </span>
              </div>
              <Progress
                value={
                  records.length > 0
                    ? Math.min(100, (records.length / 10) * 100)
                    : 0
                }
                className="h-2"
              />
              <p className="text-xs text-teal mt-2 font-medium">
                {records.length >= 10
                  ? "10+ records managed"
                  : `${records.length} of 10 sample records`}
              </p>
            </CardContent>
          </Card>

          {/* Sharing card */}
          <Card className="border border-border shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-teal" />
                </div>
                <p className="font-semibold text-sm text-foreground">Sharing</p>
              </div>
              <div className="flex justify-center mb-4">
                <img
                  src={qrImageUrl}
                  alt="Share QR Code"
                  className="w-[140px] h-[140px] rounded-lg border border-border"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-navy hover:bg-navy/90 text-white text-xs"
                  onClick={onShare}
                  data-ocid="dashboard.primary_button"
                >
                  <Link2 className="w-3.5 h-3.5 mr-1.5" />
                  Share Link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={onShare}
                  data-ocid="dashboard.secondary_button"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1.5" />
                  Provider
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
