import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  CheckCircle,
  Copy,
  Stethoscope,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useShares } from "../hooks/useShares";
import type { HealthRecord, ShareInvite } from "../types/records";
import { CATEGORY_ICONS } from "../types/records";

interface InviteShareModalProps {
  open: boolean;
  onClose: () => void;
  records: HealthRecord[];
}

type ExpiryMode = "date" | "days";
type RecipientType = "doctor" | "relative" | "other";

const RECIPIENT_TYPES: {
  value: RecipientType;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "doctor",
    label: "Doctor / Provider",
    icon: <Stethoscope className="w-4 h-4" />,
  },
  {
    value: "relative",
    label: "Family / Relative",
    icon: <Users className="w-4 h-4" />,
  },
  { value: "other", label: "Other", icon: <User className="w-4 h-4" /> },
];

export default function InviteShareModal({
  open,
  onClose,
  records,
}: InviteShareModalProps) {
  const { createShare } = useShares();

  const [recipientLabel, setRecipientLabel] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("doctor");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expiryMode, setExpiryMode] = useState<ExpiryMode>("days");
  const [expiryDays, setExpiryDays] = useState("7");
  const [expiryDate, setExpiryDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdInvite, setCreatedInvite] = useState<ShareInvite | null>(null);
  const [copied, setCopied] = useState(false);

  const generatedUrl = createdInvite
    ? `${window.location.origin}?share=${createdInvite.token}`
    : "";

  const toggleRecord = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(records.map((r) => r.id)));
  };

  const clearAll = () => setSelectedIds(new Set());

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!recipientLabel.trim()) errs.name = "Recipient name is required.";
    if (selectedIds.size === 0) errs.records = "Select at least one record.";
    if (expiryMode === "days") {
      const d = Number.parseInt(expiryDays, 10);
      if (Number.isNaN(d) || d < 1 || d > 365)
        errs.expiry = "Enter a number between 1 and 365.";
    } else {
      if (!expiryDate) {
        errs.expiry = "Please select an expiry date.";
      } else {
        const ts = new Date(expiryDate).getTime();
        if (ts <= Date.now())
          errs.expiry = "Expiry date must be in the future.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    let expiresAt: number;
    if (expiryMode === "days") {
      expiresAt =
        Date.now() + Number.parseInt(expiryDays, 10) * 24 * 60 * 60 * 1000;
    } else {
      expiresAt = new Date(expiryDate).getTime();
    }
    const invite = createShare({
      recipientLabel: recipientLabel.trim(),
      recipientType,
      recordIds: Array.from(selectedIds),
      expiresAt,
    });
    setCreatedInvite(invite);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setRecipientLabel("");
    setRecipientType("doctor");
    setSelectedIds(new Set());
    setExpiryMode("days");
    setExpiryDays("7");
    setExpiryDate("");
    setErrors({});
    setCreatedInvite(null);
    setCopied(false);
    onClose();
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="invite.dialog"
      >
        {!createdInvite ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <UserPlus className="w-5 h-5 text-teal" />
                Create Shared Access
              </DialogTitle>
              <DialogDescription>
                Invite a doctor or relative to view specific records for a
                limited time.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-1">
              {/* Recipient name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="recipient-name"
                  className="text-sm font-semibold"
                >
                  Recipient Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="recipient-name"
                  placeholder="e.g. Dr. Smith, Mom"
                  value={recipientLabel}
                  onChange={(e) => setRecipientLabel(e.target.value)}
                  data-ocid="invite.input"
                />
                {errors.name && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="invite.error_state"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Recipient type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Recipient Type</Label>
                <RadioGroup
                  value={recipientType}
                  onValueChange={(v) => setRecipientType(v as RecipientType)}
                  className="flex flex-col gap-2"
                >
                  {RECIPIENT_TYPES.map((rt) => (
                    <label
                      key={rt.value}
                      htmlFor={`rt-${rt.value}`}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        recipientType === rt.value
                          ? "border-teal bg-accent/60"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <RadioGroupItem value={rt.value} id={`rt-${rt.value}`} />
                      <span className="text-muted-foreground">{rt.icon}</span>
                      <span className="text-sm font-medium">{rt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Record selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Records to Share <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-xs text-teal hover:underline"
                    >
                      All
                    </button>
                    <span className="text-muted-foreground text-xs">·</span>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      None
                    </button>
                  </div>
                </div>
                <ScrollArea className="h-44 rounded-lg border border-border p-1">
                  <div className="space-y-1 p-1">
                    {records.map((rec) => (
                      <label
                        key={rec.id}
                        htmlFor={`rec-${rec.id}`}
                        className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors ${
                          selectedIds.has(rec.id)
                            ? "bg-accent/60"
                            : "hover:bg-muted/40"
                        }`}
                      >
                        <Checkbox
                          id={`rec-${rec.id}`}
                          checked={selectedIds.has(rec.id)}
                          onCheckedChange={() => toggleRecord(rec.id)}
                        />
                        <span className="text-base">
                          {CATEGORY_ICONS[rec.category]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {rec.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rec.category} · {rec.date}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
                {errors.records && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="invite.records.error_state"
                  >
                    {errors.records}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {selectedIds.size} of {records.length} records selected
                </p>
              </div>

              <Separator />

              {/* Expiry */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Access Expires</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setExpiryMode("days")}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border font-medium transition-colors ${
                      expiryMode === "days"
                        ? "bg-teal text-white border-teal"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                    data-ocid="invite.toggle"
                  >
                    Number of Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryMode("date")}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border font-medium transition-colors ${
                      expiryMode === "date"
                        ? "bg-teal text-white border-teal"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                    data-ocid="invite.toggle"
                  >
                    Specific Date
                  </button>
                </div>

                {expiryMode === "days" ? (
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value)}
                      className="w-28"
                      data-ocid="invite.expiry.input"
                    />
                    <span className="text-sm text-muted-foreground">
                      days from now
                    </span>
                  </div>
                ) : (
                  <Input
                    type="date"
                    min={todayStr}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    data-ocid="invite.expiry.input"
                  />
                )}

                {errors.expiry && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="invite.expiry.error_state"
                  >
                    {errors.expiry}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  data-ocid="invite.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-navy hover:bg-navy/90 text-white"
                  onClick={handleSubmit}
                  data-ocid="invite.submit_button"
                >
                  Generate Link
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="space-y-6" data-ocid="invite.success_state">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle className="w-5 h-5 text-teal" />
                Invite Link Created
              </DialogTitle>
              <DialogDescription>
                Share this link with{" "}
                <span className="font-semibold text-foreground">
                  {createdInvite.recipientLabel}
                </span>
                . Access expires on{" "}
                <span className="font-semibold text-foreground">
                  {new Date(createdInvite.expiresAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            {/* URL box */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                <p className="flex-1 text-xs font-mono text-muted-foreground break-all leading-relaxed">
                  {generatedUrl}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
                  data-ocid="invite.copy_button"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-teal" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-foreground">
                Or scan QR Code
              </p>
              <div className="p-3 bg-white rounded-xl border border-border shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(generatedUrl)}`}
                  alt="QR code for share link"
                  className="w-40 h-40"
                />
              </div>
            </div>

            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="text-xs">
                {createdInvite.recordIds.length} record
                {createdInvite.recordIds.length !== 1 ? "s" : ""} shared
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {createdInvite.recipientType}
              </Badge>
            </div>

            <Button
              className="w-full bg-navy hover:bg-navy/90 text-white"
              onClick={handleClose}
              data-ocid="invite.close_button"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
