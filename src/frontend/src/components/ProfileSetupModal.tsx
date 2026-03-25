import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { useState } from "react";

interface ProfileSetupModalProps {
  open: boolean;
  onSave: (name: string) => void;
}

export default function ProfileSetupModal({
  open,
  onSave,
}: ProfileSetupModalProps) {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name.trim()) onSave(name.trim());
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm" data-ocid="profile.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-teal" />
            Welcome to DigiHealth!
          </DialogTitle>
          <DialogDescription>
            Enter your name to personalise your health hub.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Your Name</Label>
            <Input
              id="profile-name"
              placeholder="e.g. Sarah Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
              data-ocid="profile.input"
            />
          </div>
          <Button
            className="w-full bg-navy hover:bg-navy/90 text-white"
            onClick={handleSave}
            disabled={!name.trim()}
            data-ocid="profile.submit_button"
          >
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
