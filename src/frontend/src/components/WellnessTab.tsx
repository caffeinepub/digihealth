import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  Bell,
  Calendar,
  Heart,
  Plus,
  Trash2,
  TrendingUp,
  Weight,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// --- Types ---
export type MetricType =
  | "blood-pressure"
  | "weight"
  | "blood-glucose"
  | "heart-rate";
export type ReminderType =
  | "medicine-intake"
  | "doctor-appointment"
  | "appointment-schedule"
  | "medicine-purchase"
  | "custom";
export type Recurrence = "once" | "daily" | "weekly";

export interface WellnessMetric {
  id: string;
  type: MetricType;
  value: string;
  unit: string;
  date: string;
  notes?: string;
}

export interface Reminder {
  id: string;
  title: string;
  type: ReminderType;
  datetime: string;
  recurrence: Recurrence;
  notes?: string;
  enabled: boolean;
}

// --- Constants ---
const METRICS_KEY = "digihealth_wellness_metrics";
const REMINDERS_KEY = "digihealth_reminders";

const METRIC_META: Record<
  MetricType,
  { label: string; unit: string; placeholder: string; icon: React.ReactNode }
> = {
  "blood-pressure": {
    label: "Blood Pressure",
    unit: "mmHg",
    placeholder: "e.g. 120/80",
    icon: <Activity className="w-4 h-4" />,
  },
  weight: {
    label: "Weight",
    unit: "kg",
    placeholder: "e.g. 72.5",
    icon: <Weight className="w-4 h-4" />,
  },
  "blood-glucose": {
    label: "Blood Glucose",
    unit: "mg/dL",
    placeholder: "e.g. 95",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  "heart-rate": {
    label: "Heart Rate",
    unit: "bpm",
    placeholder: "e.g. 72",
    icon: <Heart className="w-4 h-4" />,
  },
};

const REMINDER_ICONS: Record<ReminderType, string> = {
  "medicine-intake": "💊",
  "doctor-appointment": "🏥",
  "appointment-schedule": "📅",
  "medicine-purchase": "🛒",
  custom: "🔔",
};

const REMINDER_LABELS: Record<ReminderType, string> = {
  "medicine-intake": "Medicine Intake",
  "doctor-appointment": "Doctor Appointment",
  "appointment-schedule": "Appointment Schedule",
  "medicine-purchase": "Medicine Purchase",
  custom: "Custom",
};

// --- Storage helpers ---
function loadMetrics(): WellnessMetric[] {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMetrics(m: WellnessMetric[]) {
  localStorage.setItem(METRICS_KEY, JSON.stringify(m));
}

function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReminders(r: Reminder[]) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(r));
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// --- Sub-components ---

function HealthMetricsTab() {
  const [metrics, setMetrics] = useState<WellnessMetric[]>(() => loadMetrics());
  const [logOpen, setLogOpen] = useState(false);
  const [form, setForm] = useState<{
    type: MetricType;
    value: string;
    date: string;
    notes: string;
  }>({
    type: "blood-pressure",
    value: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const handleLog = () => {
    if (!form.value.trim()) {
      toast.error("Please enter a value.");
      return;
    }
    const entry: WellnessMetric = {
      id: genId(),
      type: form.type,
      value: form.value.trim(),
      unit: METRIC_META[form.type].unit,
      date: form.date,
      notes: form.notes || undefined,
    };
    const updated = [entry, ...metrics];
    setMetrics(updated);
    saveMetrics(updated);
    setLogOpen(false);
    setForm({
      type: "blood-pressure",
      value: "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
    });
    toast.success("Metric logged!");
  };

  const handleDelete = (id: string) => {
    const updated = metrics.filter((m) => m.id !== id);
    setMetrics(updated);
    saveMetrics(updated);
    toast.success("Entry removed.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Health Metrics</h3>
          <p className="text-sm text-muted-foreground">
            Track your key health indicators over time.
          </p>
        </div>
        <Button
          onClick={() => setLogOpen(true)}
          className="bg-teal hover:bg-teal/90 text-white"
          data-ocid="wellness.metrics.primary_button"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Log Entry
        </Button>
      </div>

      {/* Metric summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(METRIC_META) as MetricType[]).map((type) => {
          const latest = metrics.find((m) => m.type === type);
          const meta = METRIC_META[type];
          return (
            <Card key={type} className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-teal">
                  {meta.icon}
                  <span className="text-xs font-medium text-muted-foreground">
                    {meta.label}
                  </span>
                </div>
                {latest ? (
                  <>
                    <p className="text-xl font-bold text-foreground">
                      {latest.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {latest.unit} ·{" "}
                      {new Date(latest.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No data yet
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent entries */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">
          Recent Entries
        </h4>
        <AnimatePresence>
          {metrics.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-border text-center"
              data-ocid="wellness.metrics.empty_state"
            >
              <Activity className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                No metrics logged yet
              </p>
              <p className="text-xs text-muted-foreground">
                Start tracking your health by logging your first entry.
              </p>
            </motion.div>
          ) : (
            metrics.slice(0, 20).map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ delay: i * 0.03 }}
                data-ocid={`wellness.metrics.item.${i + 1}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border"
              >
                <div className="w-9 h-9 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
                  {METRIC_META[m.type].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {m.value}{" "}
                      <span className="font-normal text-muted-foreground">
                        {m.unit}
                      </span>
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {METRIC_META[m.type].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {m.notes && ` · ${m.notes}`}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => handleDelete(m.id)}
                  data-ocid={`wellness.metrics.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent data-ocid="wellness.metrics.dialog">
          <DialogHeader>
            <DialogTitle>Log Health Metric</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Metric Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, type: v as MetricType, value: "" }))
                }
              >
                <SelectTrigger data-ocid="wellness.metrics.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(METRIC_META) as MetricType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {METRIC_META[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Value ({METRIC_META[form.type].unit})</Label>
              <Input
                placeholder={METRIC_META[form.type].placeholder}
                value={form.value}
                onChange={(e) =>
                  setForm((p) => ({ ...p, value: e.target.value }))
                }
                data-ocid="wellness.metrics.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="wellness.metrics.date_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any additional notes..."
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={2}
                data-ocid="wellness.metrics.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogOpen(false)}
              data-ocid="wellness.metrics.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-teal hover:bg-teal/90 text-white"
              onClick={handleLog}
              data-ocid="wellness.metrics.submit_button"
            >
              Log Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InsightsTab() {
  const metrics = loadMetrics();

  const byType = (Object.keys(METRIC_META) as MetricType[])
    .map((type) => {
      const entries = metrics.filter((m) => m.type === type);
      const last3 = entries.slice(0, 3).map((m) => m.value);
      return { type, entries, last3 };
    })
    .filter((g) => g.entries.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground">Health Insights</h3>
        <p className="text-sm text-muted-foreground">
          A summary of your recent health data.
        </p>
      </div>

      {metrics.length < 3 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="w-10 h-10 text-teal mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">
              Keep logging to unlock insights!
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Log at least 3 health metrics to see trends and summaries here.
              You&apos;re doing great — keep it up!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {byType.map(({ type, entries, last3 }) => (
            <Card key={type} className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <span className="text-teal">{METRIC_META[type].icon}</span>
                  {METRIC_META[type].label}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {entries.length} entries
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {entries[0].value}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {METRIC_META[type].unit}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Latest
                  </span>
                </div>
                {last3.length >= 2 && (
                  <p className="text-xs text-muted-foreground">
                    Last {last3.length} readings:{" "}
                    <span className="font-medium text-foreground">
                      {last3.join(" → ")}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {byType.length === 0 && metrics.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-border text-center"
          data-ocid="wellness.insights.empty_state"
        >
          <TrendingUp className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            No data yet
          </p>
          <p className="text-xs text-muted-foreground">
            Head to Health Metrics and start logging to see insights.
          </p>
        </div>
      )}
    </div>
  );
}

function RemindersTab() {
  const [reminders, setReminders] = useState<Reminder[]>(() => loadReminders());
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    type: ReminderType;
    datetime: string;
    recurrence: Recurrence;
    notes: string;
  }>({
    title: "",
    type: "medicine-intake",
    datetime: "",
    recurrence: "once",
    notes: "",
  });

  const handleAdd = () => {
    if (!form.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (!form.datetime) {
      toast.error("Please select a date and time.");
      return;
    }
    const reminder: Reminder = {
      id: genId(),
      title: form.title.trim(),
      type: form.type,
      datetime: form.datetime,
      recurrence: form.recurrence,
      notes: form.notes || undefined,
      enabled: true,
    };
    const updated = [reminder, ...reminders];
    setReminders(updated);
    saveReminders(updated);
    setAddOpen(false);
    setForm({
      title: "",
      type: "medicine-intake",
      datetime: "",
      recurrence: "once",
      notes: "",
    });
    toast.success("Reminder added!");
  };

  const handleToggle = (id: string, enabled: boolean) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled } : r));
    setReminders(updated);
    saveReminders(updated);
  };

  const handleDelete = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
    toast.success("Reminder deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Reminders</h3>
          <p className="text-sm text-muted-foreground">
            Never miss a dose, appointment, or refill.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-teal hover:bg-teal/90 text-white"
          data-ocid="wellness.reminders.primary_button"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Reminder
        </Button>
      </div>

      <AnimatePresence>
        {reminders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-border text-center"
            data-ocid="wellness.reminders.empty_state"
          >
            <Bell className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              No reminders set
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Add reminders for medicines, appointments, and more.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddOpen(true)}
              data-ocid="wellness.reminders.secondary_button"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add your first reminder
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {reminders.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ delay: i * 0.03 }}
                data-ocid={`wellness.reminders.item.${i + 1}`}
                className={`flex items-start gap-3 p-4 rounded-xl border border-border bg-white transition-opacity ${r.enabled ? "" : "opacity-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-lg shrink-0">
                  {REMINDER_ICONS[r.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">
                      {r.title}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {REMINDER_LABELS[r.type]}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {r.recurrence}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(r.datetime).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  {r.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={r.enabled}
                    onCheckedChange={(v) => handleToggle(r.id, v)}
                    data-ocid={`wellness.reminders.switch.${i + 1}`}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(r.id)}
                    data-ocid={`wellness.reminders.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="wellness.reminders.dialog">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Take Metformin 500mg"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                data-ocid="wellness.reminders.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reminder Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, type: v as ReminderType }))
                }
              >
                <SelectTrigger data-ocid="wellness.reminders.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(REMINDER_ICONS) as ReminderType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {REMINDER_ICONS[t]} {REMINDER_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date &amp; Time</Label>
              <Input
                type="datetime-local"
                value={form.datetime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, datetime: e.target.value }))
                }
                data-ocid="wellness.reminders.datetime_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Recurrence</Label>
              <Select
                value={form.recurrence}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, recurrence: v as Recurrence }))
                }
              >
                <SelectTrigger data-ocid="wellness.reminders.recurrence_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">One-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any additional notes..."
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={2}
                data-ocid="wellness.reminders.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="wellness.reminders.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-teal hover:bg-teal/90 text-white"
              onClick={handleAdd}
              data-ocid="wellness.reminders.submit_button"
            >
              Add Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Main component ---
export default function WellnessTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Wellness</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Track your health metrics, gain insights, and stay on top of
          reminders.
        </p>
      </div>

      <Tabs defaultValue="metrics">
        <TabsList className="mb-6">
          <TabsTrigger value="metrics" data-ocid="wellness.tab">
            Health Metrics
          </TabsTrigger>
          <TabsTrigger value="insights" data-ocid="wellness.tab">
            Insights
          </TabsTrigger>
          <TabsTrigger value="reminders" data-ocid="wellness.tab">
            Reminders
          </TabsTrigger>
        </TabsList>
        <TabsContent value="metrics">
          <HealthMetricsTab />
        </TabsContent>
        <TabsContent value="insights">
          <InsightsTab />
        </TabsContent>
        <TabsContent value="reminders">
          <RemindersTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
