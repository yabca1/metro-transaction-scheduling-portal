export type ScheduleStatus = 'ACTIVE' | 'PAUSED' | 'SUSPENDED' | 'CANCELLED' | 'COMPLETED';
export type ExecutionStatus = 'SUCCEEDED' | 'FAILED' | 'PROCESSING' | 'SCHEDULED' | 'ESCALATED' | 'SKIPPED';

export interface Schedule {
  id: string; reference: string; owner: string; ownerType: 'CUSTOMER' | 'MERCHANT'; transactionType: string;
  source: string; destination: string; amount: string; currency: string; cadence: string; timezone: string;
  status: ScheduleStatus; nextExecution: string; lastExecution?: string; version: number; createdAt: string;
  amountType?: 'FIXED' | 'DYNAMIC'; sourceType?: string; destinationType?: string; scheduleType?: string;
  startAt?: string; endAt?: string; recurrenceRule?: string; purposeCode?: string; updatedAt?: string;
  charge?: string; chargeCalculatedAt?: string; metadata?: Record<string, string>;
  policy?: { businessDay: string; holidayAdjustment: string; insufficientFunds: string; missedRun: string; missedRunGraceSeconds: number; overlap: string; maxBusinessRetries: number; businessRetrySeconds: number };
}

export interface Execution {
  id: string; reference: string; scheduleId: string; scheduleReference: string; transactionType: string;
  amount: string; currency: string; status: ExecutionStatus; trigger: 'SCHEDULED' | 'MANUAL' | 'RETRY';
  scheduledAt: string; effectiveAt?: string; attemptCount: number; failureCode?: string; failureMessage?: string; financialReference?: string;
  scheduleVersion?: number; createdAt?: string; updatedAt?: string;
}

export const schedules: Schedule[] = [
  { id: 'sch-01', reference: 'SCH-2026-009821', owner: 'Abebe Kebede', ownerType: 'CUSTOMER', transactionType: 'WALLET_TRANSFER', source: '•••• 4001', destination: '•••• 0921', amount: '1,500.00', currency: 'ETB', cadence: 'Monthly · 25th', timezone: 'Africa/Addis_Ababa', status: 'ACTIVE', nextExecution: 'Sep 25, 2026 · 09:00', lastExecution: 'Aug 25, 2026 · 09:00', version: 3, createdAt: 'Jun 12, 2026' },
  { id: 'sch-02', reference: 'SCH-2026-009756', owner: 'Blue Nile Trading PLC', ownerType: 'MERCHANT', transactionType: 'SUPPLIER_PAYMENT', source: '•••• 8024', destination: '•••• 7710', amount: '48,200.00', currency: 'ETB', cadence: 'Weekly · Friday', timezone: 'Africa/Addis_Ababa', status: 'ACTIVE', nextExecution: 'Sep 25, 2026 · 16:30', lastExecution: 'Sep 18, 2026 · 16:30', version: 6, createdAt: 'May 03, 2026' },
  { id: 'sch-03', reference: 'SCH-2026-009612', owner: 'Selam Tesfaye', ownerType: 'CUSTOMER', transactionType: 'BILL_PAYMENT', source: '•••• 1882', destination: 'EEU prepaid', amount: '650.00', currency: 'ETB', cadence: 'Monthly · 1st', timezone: 'Africa/Addis_Ababa', status: 'PAUSED', nextExecution: 'Oct 01, 2026 · 08:00', lastExecution: 'Sep 01, 2026 · 08:00', version: 2, createdAt: 'Mar 18, 2026' },
  { id: 'sch-04', reference: 'SCH-2026-009511', owner: 'Horizon Foods SC', ownerType: 'MERCHANT', transactionType: 'PAYROLL', source: '•••• 5100', destination: 'Batch · 82 staff', amount: '386,450.00', currency: 'ETB', cadence: 'Monthly · Last business day', timezone: 'Africa/Addis_Ababa', status: 'SUSPENDED', nextExecution: 'Sep 30, 2026 · 07:00', lastExecution: 'Aug 31, 2026 · 07:00', version: 8, createdAt: 'Jan 10, 2026' },
  { id: 'sch-05', reference: 'SCH-2026-009344', owner: 'Mekdes Alemu', ownerType: 'CUSTOMER', transactionType: 'SAVINGS_TRANSFER', source: '•••• 1132', destination: 'Goal · Home', amount: '2,000.00', currency: 'ETB', cadence: 'Monthly · 5th', timezone: 'Africa/Addis_Ababa', status: 'ACTIVE', nextExecution: 'Oct 05, 2026 · 10:00', lastExecution: 'Sep 05, 2026 · 10:00', version: 4, createdAt: 'Feb 05, 2026' },
  { id: 'sch-06', reference: 'SCH-2025-006812', owner: 'Desta Retail', ownerType: 'MERCHANT', transactionType: 'MERCHANT_SETTLEMENT', source: 'Settlement balance', destination: '•••• 9920', amount: 'Dynamic', currency: 'ETB', cadence: 'Daily · 23:00', timezone: 'Africa/Addis_Ababa', status: 'COMPLETED', nextExecution: '—', lastExecution: 'Sep 20, 2026 · 23:00', version: 31, createdAt: 'Nov 22, 2025' },
];

export const executions: Execution[] = [
  { id: 'exe-01', reference: 'EXE-2026-442081', scheduleId: 'sch-02', scheduleReference: 'SCH-2026-009756', transactionType: 'SUPPLIER_PAYMENT', amount: '48,200.00', currency: 'ETB', status: 'SUCCEEDED', trigger: 'SCHEDULED', scheduledAt: 'Sep 18, 2026 · 16:30', effectiveAt: 'Sep 18, 2026 · 16:31', attemptCount: 1, financialReference: 'FT-8910024' },
  { id: 'exe-02', reference: 'EXE-2026-442077', scheduleId: 'sch-04', scheduleReference: 'SCH-2026-009511', transactionType: 'PAYROLL', amount: '386,450.00', currency: 'ETB', status: 'ESCALATED', trigger: 'SCHEDULED', scheduledAt: 'Sep 22, 2026 · 07:00', attemptCount: 3, failureCode: 'PARTIAL_BATCH_FAILURE', failureMessage: 'Seven beneficiary instructions require operator review.' },
  { id: 'exe-03', reference: 'EXE-2026-442069', scheduleId: 'sch-01', scheduleReference: 'SCH-2026-009821', transactionType: 'WALLET_TRANSFER', amount: '1,500.00', currency: 'ETB', status: 'FAILED', trigger: 'SCHEDULED', scheduledAt: 'Sep 22, 2026 · 09:00', attemptCount: 2, failureCode: 'INSUFFICIENT_FUNDS', failureMessage: 'Available balance was below scheduled amount.' },
  { id: 'exe-04', reference: 'EXE-2026-442055', scheduleId: 'sch-03', scheduleReference: 'SCH-2026-009612', transactionType: 'BILL_PAYMENT', amount: '650.00', currency: 'ETB', status: 'SKIPPED', trigger: 'SCHEDULED', scheduledAt: 'Sep 21, 2026 · 08:00', attemptCount: 0, failureCode: 'SCHEDULE_PAUSED', failureMessage: 'Occurrence skipped because the schedule was paused.' },
  { id: 'exe-05', reference: 'EXE-2026-442042', scheduleId: 'sch-05', scheduleReference: 'SCH-2026-009344', transactionType: 'SAVINGS_TRANSFER', amount: '2,000.00', currency: 'ETB', status: 'PROCESSING', trigger: 'MANUAL', scheduledAt: 'Sep 22, 2026 · 12:42', effectiveAt: 'Sep 22, 2026 · 12:42', attemptCount: 1 },
  { id: 'exe-06', reference: 'EXE-2026-442015', scheduleId: 'sch-02', scheduleReference: 'SCH-2026-009756', transactionType: 'SUPPLIER_PAYMENT', amount: '48,200.00', currency: 'ETB', status: 'SUCCEEDED', trigger: 'RETRY', scheduledAt: 'Sep 11, 2026 · 16:30', effectiveAt: 'Sep 11, 2026 · 16:38', attemptCount: 2, financialReference: 'FT-8901181' },
];

export const auditEvents = [
  { id: 'aud-1', action: 'EXECUTION_ESCALATED', actor: 'Marta Bekele', resource: 'EXE-2026-442077', outcome: 'Completed', reason: 'Partial payroll batch requires beneficiary review', time: 'Sep 22, 2026 · 13:08', requestId: 'req_f81c2a' },
  { id: 'aud-2', action: 'EXECUTION_RETRY_REQUESTED', actor: 'Daniel Tadesse', resource: 'EXE-2026-442069', outcome: 'Rejected', reason: 'Execution state not retryable', time: 'Sep 22, 2026 · 12:56', requestId: 'req_a192dd' },
  { id: 'aud-3', action: 'SCHEDULE_SUSPENDED', actor: 'Marta Bekele', resource: 'SCH-2026-009511', outcome: 'Completed', reason: 'Payroll exception investigation', time: 'Sep 22, 2026 · 11:44', requestId: 'req_77cb10' },
  { id: 'aud-4', action: 'EXECUTION_VIEWED', actor: 'Liya Solomon', resource: 'EXE-2026-442055', outcome: 'Completed', reason: 'Support case SUP-29218', time: 'Sep 22, 2026 · 10:21', requestId: 'req_361aac' },
];

export const getSchedule = (id: string) => schedules.find((item) => item.id === id || item.reference === id);
export const getExecution = (id: string) => executions.find((item) => item.id === id || item.reference === id);
