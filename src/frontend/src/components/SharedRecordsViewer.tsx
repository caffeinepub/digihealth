import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CalendarClock,
  FileText,
  Lock,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useShares } from "../hooks/useShares";
import type { HealthRecord, ShareInvite } from "../types/records";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../types/records";

interface SharedRecordsViewerProps {
  token: string;
  allRecords: HealthRecord[];
  patientName?: string;
}

function RecipientIcon({ type }: { type: ShareInvite["recipientType"] }) {
  if (type === "doctor") return <Stethoscope className="w-4 h-4" />;
  if (type === "relative") return <Users className="w-4 h-4" />;
  return <User className="w-4 h-4" />;
}

export default function SharedRecordsViewer({
  token,
  allRecords,
  patientName = "Patient",
}: SharedRecordsViewerProps) {
  const { getShare } = useShares();
  const invite = getShare(token);

  if (!invite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-sm"
          data-ocid="shared.error_state"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Link Not Found</h1>
          <p className="text-muted-foreground text-sm">
            This share link doesn&apos;t exist or may have been revoked. Please
            request a new link from the patient.
          </p>
        </motion.div>
      </div>
    );
  }

  const isExpired = Date.now() > invite.expiresAt;

  if (isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-sm"
          data-ocid="shared.expired.error_state"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Access Expired
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              This shared view expired on{" "}
              <span className="font-semibold">
                {new Date(invite.expiresAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              .
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/60 border border-border text-sm text-muted-foreground">
            Record access for{" "}
            <span className="font-semibold text-foreground">
              {invite.recipientLabel}
            </span>{" "}
            has ended. Please request a new invite from the patient.
          </div>
        </motion.div>
      </div>
    );
  }

  const sharedRecords = allRecords.filter((r) =>
    invite.recordIds.includes(r.id),
  );

  const expiresDate = new Date(invite.expiresAt);
  const hoursLeft = (invite.expiresAt - Date.now()) / (1000 * 60 * 60);
  const soonExpiring = hoursLeft < 48;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-xs">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-teal" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Shared health records via
            </p>
            <p className="text-sm font-bold text-foreground">DigiHealth</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
          data-ocid="shared.panel"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Records shared by {patientName}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4 shrink-0" />
            <span className={soonExpiring ? "text-amber-600 font-medium" : ""}>
              Access expires on{" "}
              {expiresDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {soonExpiring && " — expiring soon"}
            </span>
          </p>
        </motion.div>

        {/* Recipient info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-accent/50 border border-border"
        >
          <div className="w-10 h-10 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
            <RecipientIcon type={invite.recipientType} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {invite.recipientLabel}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {invite.recipientType}
            </p>
          </div>
          <Badge className="ml-auto bg-teal/10 text-teal border-teal/20 hover:bg-teal/20 text-xs">
            Read-only
          </Badge>
        </motion.div>

        {/* Records list */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal" />
              {sharedRecords.length} Shared Record
              {sharedRecords.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1" data-ocid="shared.list">
            {sharedRecords.length === 0 ? (
              <p
                className="text-sm text-muted-foreground py-4 text-center"
                data-ocid="shared.empty_state"
              >
                No records available.
              </p>
            ) : (
              sharedRecords.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.07 + i * 0.04 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  data-ocid={`shared.item.${i + 1}`}
                >
                  <span className="text-lg mt-0.5">
                    {CATEGORY_ICONS[rec.category]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        {rec.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${CATEGORY_COLORS[rec.category]}`}
                      >
                        {rec.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {rec.provider} · {rec.date}
                    </p>
                    {rec.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {rec.notes}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Footer note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-4 rounded-xl bg-muted/40 border border-border">
          <ShieldCheck className="w-4 h-4 text-teal shrink-0" />
          This is a read-only view. Shared via DigiHealth. No data is stored on
          this device.
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-teal transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
