# DigiHealth

## Current State
- Full dashboard, My Records, Appointments (SharingPanel with InviteShareModal), Wellness (placeholder), Support (placeholder)
- SharingPanel has: active invites list, expired invites collapse section, create invite modal
- ShareInvite type: token, recipientLabel, recipientType, recordIds, expiresAt, createdAt
- useShares hook: createShare, revokeShare, getShare, activeShares, expiredShares
- Wellness tab is a placeholder with "coming soon" message

## Requested Changes (Diff)

### Add
- **WellnessTab component**: Full wellness tracking with:
  - Health metrics tracking (blood pressure, weight, blood glucose, heart rate) - user can log entries manually
  - Health insights section: trends and summaries based on logged metrics
  - Reminders system: customizable reminders for medicine intake, doctor appointment, appointment schedule, medicine purchase, and custom types
  - Each reminder has: title, type, date/time, recurrence (once/daily/weekly), notes, enabled toggle
  - Reminders stored in localStorage
- **Sharing History tab** inside the Appointments tab: audit log showing all share events (created, revoked, expired) with timestamps, recipient info, sharing ID
- **ShareAuditLog type**: token, action (created/revoked/expired), timestamp, recipientLabel, recipientType, recordCount

### Modify
- **SharingPanel**: 
  - Rename "Active Invites" section label to "Active Sharing IDs"
  - Rename "Create Invite" button to "New Share"
  - Add internal tabs: "Sharing" (active IDs + unshare) and "Sharing History" (audit log)
  - Each active share card shows the Share ID (truncated token) prominently
  - "Unshare" button on active shares to immediately revoke (replaces Revoke)
  - Expired shares moved to Sharing History tab as audit entries
  - On share creation: append audit log entry (action: created)
  - On revoke: append audit log entry (action: revoked), keep in history
- **useShares hook**: add audit log state + persistence, addAuditEntry function
- **ShareInvite type**: no change needed
- **types/records.ts**: add ShareAuditEntry type
- **App.tsx**: Wire up WellnessTab component for wellness tab (replace placeholder)

### Remove
- Wellness "coming soon" placeholder in App.tsx
- Collapsed "expired shares" section in SharingPanel (moved to Sharing History tab)

## Implementation Plan
1. Add ShareAuditEntry type to types/records.ts
2. Update useShares hook: add auditLog state, addAuditEntry, persist to localStorage; call addAuditEntry on createShare and revokeShare
3. Create WellnessTab component with health metrics logging, insights, and reminders
4. Update SharingPanel: add internal tabs (Sharing / Sharing History), rename labels, show Share ID, immediate unshare button, audit log list
5. Update App.tsx: render WellnessTab for wellness tab
