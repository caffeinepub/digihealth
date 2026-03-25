import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Clock,
  Copy,
  History,
  Link,
  Plus,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useShares } from "../hooks/useShares";
import type {
  HealthRecord,
  ShareAuditEntry,
  ShareInvite,
} from "../types/records";
import InviteShareModal from "./InviteShareModal";

interface SharingPanelProps {
  records: HealthRecord[];
  userName: string;
}

function RecipientIcon({ type }: { type: ShareInvite["recipientType"] }) {
  if (type === "doctor") return <Stethoscope className="w-4 h-4" />;
  if (type === "relative") return <Users className="w-4 h-4" />;
  return <User className="w-4 h-4" />;
}

function ShareCard({
  invite,
  onUnshare,
  index,
}: {
  invite: ShareInvite;
  onUnshare: (token: string) => void;
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}?share=${invite.token}`;
  const hoursLeft = (invite.expiresAt - Date.now()) / (1000 * 60 * 60);
  const soonExpiring = hoursLeft < 48;
  const expiresDate = new Date(invite.expiresAt);
  const shortId = invite.token.slice(0, 12);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ delay: index * 0.04 }}
      data-ocid={`shares.item.${index + 1}`}
      className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-10 h-10 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
        <RecipientIcon type={invite.recipientType} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground truncate">
            {invite.recipientLabel}
          </p>
          <Badge variant="outline" className="text-xs capitalize">
            {invite.recipientType}
          </Badge>
        </div>
        <p className="text-xs font-mono text-muted-foreground mt-0.5 tracking-wider">
          ID: {shortId}
        </p>
        <p className="text-xs text-muted-foreground">
          {invite.recordIds.length} record
          {invite.recordIds.length !== 1 ? "s" : ""}
        </p>
        <p
          className={`text-xs font-medium flex items-center gap-1 mt-0.5 ${soonExpiring ? "text-amber-600" : "text-muted-foreground"}`}
        >
          <Clock className="w-3 h-3" />
          Expires{" "}
          {expiresDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {soonExpiring && " · Expiring soon"}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
          title="Copy link"
          data-ocid={`shares.copy_button.${index + 1}`}
        >
          {copied ? (
            <Check className="w-4 h-4 text-teal" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
              data-ocid={`shares.delete_button.${index + 1}`}
            >
              Unshare
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="shares.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Unshare Access?</AlertDialogTitle>
              <AlertDialogDescription>
                This will immediately revoke access for{" "}
                <span className="font-semibold">{invite.recipientLabel}</span>.
                The share link will stop working right away.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="shares.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onUnshare(invite.token)}
                className="bg-destructive hover:bg-destructive/90 text-white"
                data-ocid="shares.confirm_button"
              >
                Unshare Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

function AuditBadge({ action }: { action: ShareAuditEntry["action"] }) {
  if (action === "created")
    return (
      <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
        Created
      </Badge>
    );
  if (action === "revoked")
    return (
      <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
        Revoked
      </Badge>
    );
  return (
    <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
      Expired
    </Badge>
  );
}

function formatAuditTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SharingPanel({ records }: SharingPanelProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { activeShares, revokeShare, auditLog } = useShares();

  const handleUnshare = (token: string) => {
    revokeShare(token);
    toast.success("Access revoked immediately.");
  };

  const sortedAudit = [...auditLog].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sharing</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Control who can view your records and manage access history.
        </p>
      </div>

      <Tabs defaultValue="sharing">
        <TabsList className="mb-4">
          <TabsTrigger value="sharing" data-ocid="shares.tab">
            Sharing
          </TabsTrigger>
          <TabsTrigger value="history" data-ocid="shares.tab">
            Sharing History
          </TabsTrigger>
        </TabsList>

        {/* Sharing tab */}
        <TabsContent value="sharing" className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Active Sharing IDs
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {activeShares.length} active
              </Badge>
              <Button
                className="bg-navy hover:bg-navy/90 text-white"
                size="sm"
                onClick={() => setInviteOpen(true)}
                data-ocid="shares.primary_button"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                New Share
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/50 border border-border">
            <ShieldCheck className="w-5 h-5 text-teal shrink-0" />
            <p className="text-sm text-muted-foreground">
              All shares are time-limited. Access expires automatically — you
              can also unshare immediately.
            </p>
          </div>

          <AnimatePresence>
            {activeShares.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-border text-center"
                data-ocid="shares.empty_state"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Link className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  No active shares
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Share records with a doctor or relative securely.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInviteOpen(true)}
                  data-ocid="shares.secondary_button"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Create your first share
                </Button>
              </motion.div>
            ) : (
              activeShares.map((invite, i) => (
                <ShareCard
                  key={invite.token}
                  invite={invite}
                  onUnshare={handleUnshare}
                  index={i}
                />
              ))
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Sharing History tab */}
        <TabsContent value="history" className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              Sharing History
            </h3>
            <p className="text-sm text-muted-foreground">
              Audit log of all sharing activity.
            </p>
          </div>

          <Separator />

          {sortedAudit.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-border text-center"
              data-ocid="shares.history.empty_state"
            >
              <History className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                No sharing history yet
              </p>
              <p className="text-xs text-muted-foreground">
                Actions like creating or revoking shares will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedAudit.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  data-ocid={`shares.history.item.${i + 1}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white border border-border"
                >
                  <div className="mt-0.5">
                    <AuditBadge action={entry.action} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {entry.recipientLabel}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground tracking-wider">
                      ID: {entry.token.slice(0, 12)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.recordCount} record
                      {entry.recordCount !== 1 ? "s" : ""} ·{" "}
                      <span className="capitalize">{entry.recipientType}</span>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0 text-right">
                    {formatAuditTimestamp(entry.timestamp)}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <InviteShareModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        records={records}
      />
    </motion.div>
  );
}
