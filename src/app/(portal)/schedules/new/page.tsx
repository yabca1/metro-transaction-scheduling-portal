import { PageHeader } from '@/components/shared/PageHeader';
import { CreateScheduleForm } from '@/features/schedules/CreateScheduleForm';

export default function NewSchedulePage() {
  return <div className="space-y-6"><PageHeader eyebrow="Public schedules API" title="Create a transaction schedule" description="Build a schedule using the exact instruction, recurrence, and policy fields accepted by POST /api/v1/schedules." /><CreateScheduleForm /></div>;
}
