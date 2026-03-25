import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Brain, CheckCircle2, FileText, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { HealthRecord, RecordCategory } from "../types/records";
import { ALL_CATEGORIES } from "../types/records";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (record: Omit<HealthRecord, "id">) => void;
  detectCategory: (title: string, notes: string) => RecordCategory;
}

export default function UploadModal({
  open,
  onClose,
  onAdd,
  detectCategory,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [provider, setProvider] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [aiSort, setAiSort] = useState(true);
  const [manualCategory, setManualCategory] =
    useState<RecordCategory>("Doctor Notes");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectedCategory =
    aiSort && title ? detectCategory(title, notes) : manualCategory;

  const handleFile = useCallback(
    (f: File) => {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    },
    [title],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a document title.");
      return;
    }
    setUploading(true);
    setUploadProgress(10);
    let blobUrl: string | undefined;
    try {
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress(Math.round(10 + pct * 0.8));
        });
        const url = blob.getDirectURL();
        blobUrl = url;
      }
      setUploadProgress(95);
      const category = aiSort ? detectCategory(title, notes) : manualCategory;
      onAdd({
        name: title.trim(),
        date,
        category,
        provider: provider.trim() || "Unknown Provider",
        status: "Active",
        notes: notes.trim() || undefined,
        blobUrl,
        fileName: file?.name,
      });
      setUploadProgress(100);
      toast.success(`"${title.trim()}" added successfully!`);
      handleClose();
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setTitle("");
    setNotes("");
    setProvider("");
    setDate(new Date().toISOString().split("T")[0]);
    setAiSort(true);
    setManualCategory("Doctor Notes");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="upload.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Upload className="w-5 h-5 text-teal" />
            Upload Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Drop zone */}
          <label
            htmlFor="file-dropzone"
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors block ${
              dragOver
                ? "border-teal bg-teal/5"
                : file
                  ? "border-teal/60 bg-teal/5"
                  : "border-border hover:border-teal/50 hover:bg-accent/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            data-ocid="upload.dropzone"
          >
            {file ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <CheckCircle2 className="w-10 h-10 text-teal" />
                <p className="font-medium text-foreground text-sm">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  Remove
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileText className="w-10 h-10 opacity-40" />
                <p className="text-sm font-medium">Drop your file here</p>
                <p className="text-xs">PDF, PNG, JPG, DOCX — up to 50 MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              data-ocid="upload.upload_button"
            />
          </label>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="doc-title">Document Title *</Label>
            <Input
              id="doc-title"
              placeholder="e.g. CBC Blood Test Results"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-ocid="upload.input"
            />
          </div>

          {/* Provider + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="doc-provider">Provider</Label>
              <Input
                id="doc-provider"
                placeholder="e.g. Dr. Smith"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-date">Date</Label>
              <Input
                id="doc-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="doc-notes">Notes</Label>
            <Textarea
              id="doc-notes"
              placeholder="Optional notes about this document…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-ocid="upload.textarea"
            />
          </div>

          {/* AI Sort */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  AI Smart Sort
                </p>
                <p className="text-xs text-muted-foreground">
                  Auto-detect category from title &amp; notes
                </p>
              </div>
            </div>
            <Switch
              checked={aiSort}
              onCheckedChange={setAiSort}
              data-ocid="upload.switch"
            />
          </div>

          {/* Category */}
          {aiSort && title ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-teal/5 border border-teal/20 text-sm">
              <Brain className="w-4 h-4 text-teal shrink-0" />
              <span className="text-muted-foreground">AI detected:</span>
              <span className="font-semibold text-teal">
                {detectedCategory}
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={manualCategory}
                onValueChange={(v) => setManualCategory(v as RecordCategory)}
              >
                <SelectTrigger data-ocid="upload.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-2" data-ocid="upload.loading_state">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={uploading}
              data-ocid="upload.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-navy hover:bg-navy/90 text-white"
              onClick={handleSubmit}
              disabled={uploading || !title.trim()}
              data-ocid="upload.submit_button"
            >
              {uploading ? (
                <>
                  <X className="w-4 h-4 mr-2 animate-spin" /> Uploading…
                </>
              ) : (
                "Save Document"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
