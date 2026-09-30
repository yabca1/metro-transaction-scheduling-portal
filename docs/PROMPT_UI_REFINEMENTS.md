# Task: Comprehensive UI Refinements & Master-Detail Synchronization for Metro Transaction Scheduling Portal

You are tasked with implementing a comprehensive suite of UI refinements, popover filter dropdowns, master-detail sliding drawer synchronization, and global header modals across the **Metro Transaction Scheduling Portal** (`metro-transaction-scheduling-portal`), built with Next.js App Router, React 19, Tailwind CSS 4, and Lucide icons.

Follow the specifications below precisely across all affected components, layouts, and feature domains (`schedules`, `executions`, `manual-review`, `audit`, and `system/health`).

---

## 1. Filter Dropdowns with Active Checkmarks (✓) and Click-Outside Dismissal

Replace the basic HTML `<select>` elements and simple pills in `src/components/shared/FilterBar.tsx` (and any entity-specific filter controls) with polished, animated popover cards:

### Requirements:
1. **Dropdown Trigger**:
   - Clean trigger button showing the currently selected filter label, a subtle badge indicator, and a rotating chevron icon (`ChevronDown` from `lucide-react`).
2. **Popover Content**:
   - Render a floating card (`bg-white rounded-xl shadow-xl border border-brand-border p-1.5 z-50 min-w-[200px] animate-in fade-in zoom-in-95 duration-150`).
   - Each option row must display the label, an optional count/badge, and an explicit **Checkmark (`Check` icon)** visible only on the currently active filter option.
   - Hover state: `hover:bg-brand-subtle text-brand-primary font-medium rounded-lg`.
3. **Behavior**:
   - Implement click-outside dismissal using a `useRef` and document `mousedown` listener.
   - Support `Esc` key dismissal.

### Entity Filter Options to Support:
- **Schedules (`/schedules`)**:
  - **Status Filter**: *All Statuses*, *Active*, *Paused*, *Failed*, *Completed*, *Escalated*
  - **Cadence Filter**: *All Cadences*, *Daily*, *Weekly*, *Monthly*, *Interval (Cron)*, *Ad-Hoc*
  - **Transaction Type**: *All Types*, *Merchant Settlement*, *Vendor Disbursement*, *Wallet Top-up*, *Recurring Bill*
- **Executions Queue (`/executions`)**:
  - **Status Filter**: *All Statuses*, *Success*, *Processing / In-Flight*, *Failed*, *Retrying*, *Escalated*
  - **Trigger Filter**: *All Triggers*, *Automated Chrono*, *Manual Override*, *Webhook Event*, *API Trigger*
- **Manual Review (`/manual-review`)**:
  - **Severity / Policy**: *All Severities*, *High Risk Rule*, *Anomaly Detected*, *Limit Exceeded*, *Counterparty Flagged*
  - **Disposition Status**: *All Statuses*, *Pending Review*, *Approved*, *Rejected*, *Escalated*
- **Audit Trail (`/audit`)**:
  - **Action Type**: *All Actions*, *Schedule Created*, *Schedule Paused*, *Manual Trigger*, *Policy Override*, *Configuration Updated*

---

## 2. Strict Dark Focus Rings (No Blue Highlights)

Ensure the portal adheres strictly to the Metro dark brand aesthetic without browser-default blue outlines or blue borders.

### Requirements:
1. In `src/app/globals.css`:
   - Replace `:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }` with a dark focus ring:
     ```css
     :focus-visible {
       outline: 2px solid var(--primary); /* #132238 */
       outline-offset: 2px;
     }
     ```
   - Add global focus styles for form controls:
     ```css
     :where(input, select, textarea):focus-visible {
       outline: none;
       border-color: var(--primary) !important;
       box-shadow: 0 0 0 1.5px var(--primary) !important;
     }
     ```
2. In `FilterBar.tsx` and all search/input fields:
   - Remove `focus:border-brand-blue` or any `blue` ring classes.
   - Use `focus:border-brand-primary focus:ring-1 focus:ring-brand-primary` (or `var(--primary)`).

---

## 3. Right-to-Left Master-Detail Sliding Drawer & Interaction Synchronization

Implement an interactive master-detail split layout for entity lists (specifically in `/schedules` and `/executions`):

### Requirements:
1. **Layout & Split Animation**:
   - When a row is clicked (or an inspection icon is pressed), the detail drawer opens on the right side.
   - The table container smoothly contracts its width: `transition-all duration-300 ease-in-out` (e.g. from `w-full` to `w-full lg:w-[60%] xl:w-[65%]`).
   - The detail console slides in from right to left:
     ```tsx
     className="animate-in slide-in-from-right-4 fade-in duration-300 w-full lg:w-[40%] xl:w-[35%] bg-white border border-brand-border rounded-2xl shadow-sm p-6 overflow-y-auto"
     ```
2. **Detail Console Content**:
   - Entity header with reference badge, status pill, and a dedicated **Close (✕)** button (`onCloseDetail`).
   - Deep metadata: schedule cadence, cron expression, payload preview, execution timeline, next execution countdown, retry count, and operator quick actions (Pause/Resume, Trigger Now, Edit).
3. **Auto-Close on User Interactions**:
   - The open detail side drawer must **automatically close** (`onCloseDetail()`) when the operator performs any of the following:
     - Focuses the table search input (`onFocus` event on the search box in `FilterBar.tsx`).
     - Toggles open any filter popover dropdown.
     - Navigates pages or changes pagination controls.
     - Presses the `Esc` key.

---

## 4. Global Header Search Modal & Notifications Dropdown

Enhance `src/components/layout/AppHeader.tsx` with working global modals:

### A. Centered Global Search Modal (`GlobalSearchModal.tsx`):
- Wire up the `⌘K` / `Search schedules` button in `AppHeader.tsx`.
- Support global keyboard shortcut: `Ctrl+K` / `Cmd+K` to toggle open, and `Esc` to close.
- Modal opens centered in viewport with backdrop blur (`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4`).
- Inside the modal:
  - High-visibility search input with `Search` icon and live query filtering.
  - Grouped results categorized by **Schedules**, **Executions**, **Manual Reviews**, and **Quick Navigation**.
  - Keyboard navigation support (`ArrowUp`, `ArrowDown`, `Enter` to navigate).

### B. Top-Right Notifications Dropdown (`GlobalNotificationDropdown.tsx`):
- Wire up the Bell icon button in `AppHeader.tsx`.
- Clicking opens a popover positioned directly below the bell button (`absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-brand-border z-50 overflow-hidden`).
- Features:
  - Header with "Notifications", an unread count badge, a "Mark all read" link, and a dedicated **Close (✕)** button.
  - Realistic scheduling events (e.g., *"Execution SCH-1049 failed — Retry threshold exceeded"*, *"High-value payout schedule awaiting manual review"*, *"Daily settlement batch completed"*).
  - Relative timestamps (e.g., "5m ago", "1h ago") and status severity dots (danger, warning, success).
  - Click-outside dismissal listener.

---

## 5. Dashboard Overview Refinements (`src/app/(portal)/page.tsx`)

- Harmonize all cards and metric panels with the clean page palette (`bg-white border-brand-border`).
- In "Recent Schedules", "Pending Manual Reviews", and "Upcoming Triggers" tables/cards:
  - Replace static text links with hover-activated action icon buttons (e.g. `button` with `ArrowUpRight` or `ChevronRight` that animates on hover: `group-hover:translate-x-0.5 transition-transform`).
  - Add quick action pills (Trigger Run, Inspect, Pause).

---

## 6. Verification & Quality Assurance

Before concluding, verify the implementation:
1. Run TypeScript check:
   ```bash
   npx tsc --noEmit
   ```
   Ensure 0 errors.
2. Run Next.js production build:
   ```bash
   pnpm build
   ```
   Ensure all static and dynamic routes compile cleanly with zero build or lint warnings.
3. Verify keyboard navigation (`⌘K`, `Esc`) and verify auto-close behavior when searching or selecting filters.
