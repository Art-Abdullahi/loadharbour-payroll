/*
  LoadHarbour Payroll UI — PURE TAILWIND (no component libraries)
  - Next.js App Router friendly client component
  - Uses mock data and client-side state
  - Includes: Login, Owner dashboard, Staff, Payments ledger, Audit log, Employee My Payments

  How to use:
  1) Create: app/page.tsx and paste:
     export { default } from './ui/LoadHarbourPayrollUI'
  2) Create: app/ui/LoadHarbourPayrollUI.tsx and paste this file.

  Notes:
  - UI only. No backend calls.
  - Replace handlers later with Payload CMS endpoints.
*/

'use client'

import React, { useEffect, useMemo, useState } from 'react'

// ---------------------------
// Types
// ---------------------------

type Role = 'owner' | 'employee'

type Staff = {
  id: string
  fullName: string
  jobTitle: string
  status: 'active' | 'inactive'
  email?: string
}

type PaymentMethod = 'Wise' | 'Sendwave' | 'WorldRemit'

type PaymentCategory = 'Salary' | 'Bonus' | 'Reimbursement' | 'Other'

type ReceiptStatus = 'attached' | 'missing'

type Payment = {
  id: string
  staffId: string
  monthEarned: string // YYYY-MM
  dateSent: string // ISO
  amount: number
  currency: 'USD'
  method: PaymentMethod
  category: PaymentCategory
  referenceId?: string
  notes?: string
  receiptStatus: ReceiptStatus
  receiptName?: string
  createdAt: string
  updatedAt: string
}

type AuditLog = {
  id: string
  timestamp: string
  actor: string
  action: 'create' | 'update' | 'delete'
  entityType: 'payment' | 'staff' | 'user'
  entityId: string
  summary: string
}

// ---------------------------
// Mock Data
// ---------------------------

const mockStaff: Staff[] = [
  { id: 's1', fullName: 'Amina Hassan', jobTitle: 'Operations Manager', status: 'active', email: 'amina@readycarriers.com' },
  { id: 's2', fullName: 'Brian Otieno', jobTitle: 'Dispatcher', status: 'active', email: 'brian@readycarriers.com' },
  { id: 's3', fullName: 'Fatma Noor', jobTitle: 'Accounting Assistant', status: 'active', email: 'fatma@readycarriers.com' },
  { id: 's4', fullName: 'Kelvin Mwangi', jobTitle: 'Safety Coordinator', status: 'active', email: 'kelvin@readycarriers.com' },
]

const mockPayments: Payment[] = [
  {
    id: 'p1',
    staffId: 's1',
    monthEarned: '2025-12',
    dateSent: '2026-01-03T10:45:00.000Z',
    amount: 1250,
    currency: 'USD',
    method: 'Wise',
    category: 'Salary',
    referenceId: 'WISE-7H2K9Q',
    notes: 'December salary',
    receiptStatus: 'attached',
    receiptName: 'wise-receipt-dec-2025.pdf',
    createdAt: '2026-01-03T10:50:00.000Z',
    updatedAt: '2026-01-03T10:50:00.000Z',
  },
  {
    id: 'p2',
    staffId: 's2',
    monthEarned: '2025-12',
    dateSent: '2026-01-03T11:05:00.000Z',
    amount: 900,
    currency: 'USD',
    method: 'Sendwave',
    category: 'Salary',
    referenceId: 'SW-902113',
    notes: 'December salary',
    receiptStatus: 'missing',
    createdAt: '2026-01-03T11:10:00.000Z',
    updatedAt: '2026-01-03T11:10:00.000Z',
  },
  {
    id: 'p3',
    staffId: 's3',
    monthEarned: '2026-01',
    dateSent: '2026-01-06T09:10:00.000Z',
    amount: 650,
    currency: 'USD',
    method: 'WorldRemit',
    category: 'Reimbursement',
    referenceId: 'WR-11902',
    notes: 'Receipts: office supplies',
    receiptStatus: 'attached',
    receiptName: 'worldremit-office-supplies.jpg',
    createdAt: '2026-01-06T09:15:00.000Z',
    updatedAt: '2026-01-06T09:15:00.000Z',
  },
]

const mockAudit: AuditLog[] = [
  {
    id: 'a1',
    timestamp: '2026-01-03T10:50:10.000Z',
    actor: 'Owner',
    action: 'create',
    entityType: 'payment',
    entityId: 'p1',
    summary: 'Created payment p1 for Amina Hassan (USD 1,250) | Month earned 2025-12',
  },
  {
    id: 'a2',
    timestamp: '2026-01-03T11:10:12.000Z',
    actor: 'Owner',
    action: 'create',
    entityType: 'payment',
    entityId: 'p2',
    summary: 'Created payment p2 for Brian Otieno (USD 900) | Missing receipt',
  },
  {
    id: 'a3',
    timestamp: '2026-01-06T09:15:33.000Z',
    actor: 'Owner',
    action: 'create',
    entityType: 'payment',
    entityId: 'p3',
    summary: 'Created reimbursement payment p3 for Fatma Noor (USD 650)',
  },
]

// ---------------------------
// Helpers
// ---------------------------

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function monthLabel(yyyyMm: string) {
  const [y, m] = yyyyMm.split('-').map(Number)
  if (!y || !m) return yyyyMm
  const d = new Date(Date.UTC(y, m - 1, 1))
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

// ---------------------------
// Small UI Primitives (Tailwind)
// ---------------------------

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4">{children}</div>
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 pt-5', className)}>{children}</div>
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 pb-5 pt-4', className)}>{children}</div>
}

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'warn' | 'ok' }) {
  const toneClass =
    tone === 'warn'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : tone === 'ok'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : 'bg-slate-50 text-slate-800 border-slate-200'

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', toneClass)}>
      {children}
    </span>
  )
}

function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  disabled?: boolean
}) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = size === 'sm' ? 'h-9 px-3 text-sm' : 'h-10 px-4 text-sm'
  const variants =
    variant === 'primary'
      ? 'bg-slate-900 text-white hover:bg-slate-800'
      : variant === 'outline'
      ? 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
      : variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-500'
      : 'bg-transparent text-slate-900 hover:bg-slate-100'

  return (
    <button className={cn(base, sizes, variants)} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: {
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
    />
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium text-slate-700">{children}</div>
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: Array<{ label: string; value: string }>
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="px-5 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-slate-900">{title}</div>
                {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
              </div>
              <button
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="px-5 pb-5 pt-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------
// Main
// ---------------------------

export default function LoadHarbourPayrollUI() {
  const [role, setRole] = useState<Role>('owner')
  const [isAuthed, setIsAuthed] = useState(false)
  const [currentUserStaffId, setCurrentUserStaffId] = useState<string>('s2') // employee mode

  const [staff, setStaff] = useState<Staff[]>(mockStaff)
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [audit, setAudit] = useState<AuditLog[]>(mockAudit)

  const [activeRoute, setActiveRoute] = useState<'dashboard' | 'staff' | 'payments' | 'audit' | 'my-payments'>('dashboard')
  const [query, setQuery] = useState('')

  // modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [staffModalOpen, setStaffModalOpen] = useState(false)

  const staffById = useMemo(() => {
    const map = new Map<string, Staff>()
    staff.forEach((s) => map.set(s.id, s))
    return map
  }, [staff])

  const missingReceiptsCount = useMemo(
    () => payments.filter((p) => p.receiptStatus === 'missing').length,
    [payments]
  )

  const monthTotal = useMemo(() => {
    const now = new Date()
    const yyyy = now.getUTCFullYear()
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
    const current = `${yyyy}-${mm}`
    return payments.filter((p) => p.monthEarned === current).reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  const visiblePayments = useMemo(() => {
    const base = role === 'employee' ? payments.filter((p) => p.staffId === currentUserStaffId) : payments
    const q = query.trim().toLowerCase()
    if (!q) return base
    return base.filter((p) => {
      const s = staffById.get(p.staffId)
      return (
        p.id.toLowerCase().includes(q) ||
        p.monthEarned.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.referenceId || '').toLowerCase().includes(q) ||
        (p.notes || '').toLowerCase().includes(q) ||
        (s?.fullName || '').toLowerCase().includes(q)
      )
    })
  }, [payments, role, currentUserStaffId, query, staffById])

  const recentPayments = useMemo(() => {
    return [...payments].sort((a, b) => +new Date(b.dateSent) - +new Date(a.dateSent)).slice(0, 6)
  }, [payments])

  function pushAudit(entry: Omit<AuditLog, 'id'>) {
    setAudit((prev) => [
      {
        id: `a${prev.length + 1}-${Math.random().toString(16).slice(2)}`,
        ...entry,
      },
      ...prev,
    ])
  }

  function handleCreatePayment(p: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const created: Payment = {
      ...p,
      id: `p${payments.length + 1}-${Math.random().toString(16).slice(2)}`,
      createdAt: now,
      updatedAt: now,
    }
    setPayments((prev) => [created, ...prev])
    const staffName = staffById.get(created.staffId)?.fullName || 'Staff'
    pushAudit({
      timestamp: now,
      actor: 'Owner',
      action: 'create',
      entityType: 'payment',
      entityId: created.id,
      summary: `Created payment ${created.id} for ${staffName} (${formatMoney(created.amount, created.currency)}) | Month earned ${created.monthEarned}`,
    })
  }

  function handleUpdatePayment(id: string, patch: Partial<Payment>) {
    const now = new Date().toISOString()
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now } : p)))
    pushAudit({
      timestamp: now,
      actor: 'Owner',
      action: 'update',
      entityType: 'payment',
      entityId: id,
      summary: `Updated payment ${id}`,
    })
  }

  function handleDeletePayment(id: string) {
    const now = new Date().toISOString()
    setPayments((prev) => prev.filter((p) => p.id !== id))
    pushAudit({
      timestamp: now,
      actor: 'Owner',
      action: 'delete',
      entityType: 'payment',
      entityId: id,
      summary: `Deleted payment ${id}`,
    })
  }

  function handleCreateStaff(s: Omit<Staff, 'id'>) {
    const created: Staff = { ...s, id: `s${staff.length + 1}-${Math.random().toString(16).slice(2)}` }
    setStaff((prev) => [created, ...prev])
    const now = new Date().toISOString()
    pushAudit({
      timestamp: now,
      actor: 'Owner',
      action: 'create',
      entityType: 'staff',
      entityId: created.id,
      summary: `Created staff ${created.fullName} (${created.jobTitle})`,
    })
  }

  function exportPaymentsCSV(rows: Payment[]) {
    const headers = [
      'paymentId',
      'staffName',
      'monthEarned',
      'dateSent',
      'amount',
      'currency',
      'method',
      'category',
      'referenceId',
      'notes',
      'receiptStatus',
    ]

    const lines = rows.map((p) => {
      const s = staffById.get(p.staffId)
      const vals = [
        p.id,
        s?.fullName || '',
        p.monthEarned,
        p.dateSent,
        String(p.amount),
        p.currency,
        p.method,
        p.category,
        p.referenceId || '',
        (p.notes || '').replace(/\n/g, ' '),
        p.receiptStatus,
      ]
      return vals.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })

    const csv = [headers.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `loadharbour-payroll-payments-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ---------------------------
  // Auth Gate
  // ---------------------------
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopBar
          role={role}
          onRoleChange={setRole}
          authed={false}
          onLogout={() => setIsAuthed(false)}
        />

        <Container>
          <div className="mx-auto max-w-md py-10">
            <Card>
              <CardHeader>
                <div className="text-xl font-semibold text-slate-900">LoadHarbour Payroll</div>
                <div className="mt-1 text-sm text-slate-500">Sign in to record and view payments securely.</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>

                <Button
                  variant="primary"
                  onClick={() => {
                    setIsAuthed(true)
                    setActiveRoute(role === 'owner' ? 'dashboard' : 'my-payments')
                  }}
                >
                  Sign in
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button className="text-slate-500 hover:underline">Forgot password?</button>
                  <span className="text-slate-500">Demo UI only</span>
                </div>

                <div className="h-px w-full bg-slate-200" />

                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-600">Demo mode switch (preview)</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant={role === 'owner' ? 'primary' : 'outline'} size="sm" onClick={() => setRole('owner')}>
                      Owner
                    </Button>
                    <Button variant={role === 'employee' ? 'primary' : 'outline'} size="sm" onClick={() => setRole('employee')}>
                      Employee
                    </Button>
                    {role === 'employee' && (
                      <div className="min-w-[220px]">
                        <Select
                          value={currentUserStaffId}
                          onChange={setCurrentUserStaffId}
                          options={staff.map((s) => ({ label: s.fullName, value: s.id }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    )
  }

  // ---------------------------
  // App Shell
  // ---------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar
        role={role}
        onRoleChange={(r) => {
          setRole(r)
          setActiveRoute(r === 'owner' ? 'dashboard' : 'my-payments')
        }}
        authed={true}
        onLogout={() => setIsAuthed(false)}
      />

      <Container>
        <div className="grid gap-6 py-6 lg:grid-cols-[260px_1fr]">
          <Sidebar
            role={role}
            activeRoute={activeRoute}
            onNavigate={setActiveRoute}
            missingReceiptsCount={missingReceiptsCount}
          />

          <main className="space-y-6">
            {role === 'owner' ? (
              <OwnerHeader
                query={query}
                onQueryChange={setQuery}
                onAddPayment={() => {
                  setEditingPayment(null)
                  setPaymentModalOpen(true)
                }}
                onExport={() => exportPaymentsCSV(visiblePayments)}
                monthTotal={monthTotal}
                missingReceiptsCount={missingReceiptsCount}
              />
            ) : (
              <EmployeeHeader query={query} onQueryChange={setQuery} />
            )}

            {role === 'owner' && activeRoute === 'dashboard' && (
              <OwnerDashboard
                recentPayments={recentPayments}
                staffById={staffById}
                missingReceiptsCount={missingReceiptsCount}
              />
            )}

            {role === 'owner' && activeRoute === 'staff' && (
              <StaffPage
                staff={staff}
                onAddStaff={() => setStaffModalOpen(true)}
                onToggleStatus={(id) => {
                  const s = staffById.get(id)
                  if (!s) return
                  const next = s.status === 'active' ? 'inactive' : 'active'
                  setStaff((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)))
                  pushAudit({
                    timestamp: new Date().toISOString(),
                    actor: 'Owner',
                    action: 'update',
                    entityType: 'staff',
                    entityId: id,
                    summary: `Updated staff ${s.fullName} status to ${next}`,
                  })
                }}
              />
            )}

            {((role === 'owner' && activeRoute === 'payments') || (role === 'employee' && activeRoute === 'my-payments')) && (
              <PaymentsPage
                role={role}
                payments={visiblePayments}
                staffById={staffById}
                onEdit={(p) => {
                  setEditingPayment(p)
                  setPaymentModalOpen(true)
                }}
                onDelete={(p) => handleDeletePayment(p.id)}
              />
            )}

            {role === 'owner' && activeRoute === 'audit' && <AuditPage logs={audit} />}
          </main>
        </div>
      </Container>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        staff={staff}
        staffById={staffById}
        editing={editingPayment}
        onCreate={handleCreatePayment}
        onUpdate={handleUpdatePayment}
      />

      <StaffModal
        open={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        onCreate={handleCreateStaff}
      />
    </div>
  )
}

// ---------------------------
// TopBar + Sidebar
// ---------------------------

function TopBar({
  role,
  onRoleChange,
  authed,
  onLogout,
}: {
  role: Role
  onRoleChange: (r: Role) => void
  authed: boolean
  onLogout: () => void
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <Container>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
              🔒
            </div>
            <div>
              <div className="font-semibold leading-none text-slate-900">LoadHarbour Payroll</div>
              <div className="text-xs text-slate-500">Confidential payroll ledger</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Pill>Demo</Pill>
            <div className="w-[150px]">
              <Select
                value={role}
                onChange={(v) => onRoleChange(v as Role)}
                options={[
                  { label: 'Owner', value: 'owner' },
                  { label: 'Employee', value: 'employee' },
                ]}
              />
            </div>
            {authed && (
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}

function Sidebar({
  role,
  activeRoute,
  onNavigate,
  missingReceiptsCount,
}: {
  role: Role
  activeRoute: string
  onNavigate: (r: any) => void
  missingReceiptsCount: number
}) {
  const itemsOwner = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'payments', label: 'Payments', icon: '💸' },
    { key: 'staff', label: 'Staff', icon: '👥' },
    { key: 'audit', label: 'Audit Log', icon: '🧾' },
  ] as const

  const itemsEmployee = [{ key: 'my-payments', label: 'My Payments', icon: '💼' }] as const

  const items = role === 'owner' ? itemsOwner : itemsEmployee

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 px-2 text-xs font-semibold text-slate-600">Navigation</div>
      <div className="space-y-1">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onNavigate(it.key)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition',
              activeRoute === it.key ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
            )}
          >
            <span className="flex items-center gap-2">
              <span className="w-5 text-center">{it.icon}</span>
              {it.label}
            </span>
            {role === 'owner' && it.key === 'payments' && missingReceiptsCount > 0 && (
              <Pill tone="warn">{missingReceiptsCount} missing</Pill>
            )}
          </button>
        ))}
      </div>

      <div className="my-3 h-px w-full bg-slate-200" />

      <div className="rounded-xl bg-slate-50 p-3">
        <div className="text-xs font-semibold text-slate-700">Privacy</div>
        <div className="mt-1 text-xs text-slate-500">Employees can only see their own transactions.</div>
      </div>
    </aside>
  )
}

// ---------------------------
// Headers
// ---------------------------

function OwnerHeader({
  query,
  onQueryChange,
  onAddPayment,
  onExport,
  monthTotal,
  missingReceiptsCount,
}: {
  query: string
  onQueryChange: (s: string) => void
  onAddPayment: () => void
  onExport: () => void
  monthTotal: number
  missingReceiptsCount: number
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="text-lg font-semibold text-slate-900">Owner Console</div>
            <div className="text-sm text-slate-500">Log payments, attach receipts, and keep a clean trail.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onAddPayment}>＋ Add Payment</Button>
            <Button variant="outline" onClick={onExport}>
              ⬇ Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="text-xs font-semibold text-slate-600">This month logged</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">{formatMoney(monthTotal, 'USD')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-xs font-semibold text-slate-600">Missing receipts</div>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-semibold text-slate-900">{missingReceiptsCount}</div>
            <Pill tone={missingReceiptsCount > 0 ? 'warn' : 'ok'}>{missingReceiptsCount > 0 ? 'Needs attention' : 'All good'}</Pill>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-xs font-semibold text-slate-600">Search</div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">⌕</span>
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search staff, ref ID, notes..."
                className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmployeeHeader({ query, onQueryChange }: { query: string; onQueryChange: (s: string) => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="text-lg font-semibold text-slate-900">My Payments</div>
          <div className="text-sm text-slate-500">View your individual transactions and download receipts.</div>
        </div>
        <div className="relative w-full sm:w-[360px]">
          <span className="absolute left-3 top-2.5 text-slate-400">⌕</span>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search month, notes, reference ID..."
            className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------
// Pages
// ---------------------------

function OwnerDashboard({
  recentPayments,
  staffById,
  missingReceiptsCount,
}: {
  recentPayments: Payment[]
  staffById: Map<string, Staff>
  missingReceiptsCount: number
}) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-base font-semibold text-slate-900">Recent Payments</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPayments.map((p) => {
              const s = staffById.get(p.staffId)
              return (
                <div key={p.id} className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center">
                  <div>
                    <div className="font-medium text-slate-900">
                      {s?.fullName || 'Staff'} · {formatMoney(p.amount, p.currency)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Month earned: {monthLabel(p.monthEarned)} · Sent: {formatDate(p.dateSent)} · {p.method}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill>{p.category}</Pill>
                    {p.receiptStatus === 'attached' ? <Pill tone="ok">Receipt attached</Pill> : <Pill tone="warn">Missing receipt</Pill>}
                  </div>
                </div>
              )
            })}
            {recentPayments.length === 0 && <div className="text-sm text-slate-500">No payments yet.</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-base font-semibold text-slate-900">Action Items</div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
            <div>
              <div className="font-medium text-slate-900">Receipts missing</div>
              <div className="text-xs text-slate-500">Upload receipts to complete your payment trail.</div>
            </div>
            <Pill tone={missingReceiptsCount > 0 ? 'warn' : 'ok'}>{missingReceiptsCount}</Pill>
          </div>
          <div className="text-xs text-slate-500">Tip: Keep reference IDs for Wise/Sendwave/WorldRemit for faster reconciliation.</div>
        </CardContent>
      </Card>
    </div>
  )
}

function StaffPage({ staff, onAddStaff, onToggleStatus }: { staff: Staff[]; onAddStaff: () => void; onToggleStatus: (id: string) => void }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold text-slate-900">Staff</div>
          <div className="text-sm text-slate-500">Manage internal staff and access.</div>
        </div>
        <Button onClick={onAddStaff}>＋ Add Staff</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Role</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Email</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Status</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-t border-slate-200">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{s.fullName}</div>
                    <div className="text-xs text-slate-500">{s.id}</div>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{s.jobTitle}</td>
                  <td className="px-3 py-2 text-slate-500">{s.email || '—'}</td>
                  <td className="px-3 py-2">
                    {s.status === 'active' ? <Pill tone="ok">active</Pill> : <Pill tone="neutral">inactive</Pill>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="outline" size="sm" onClick={() => onToggleStatus(s.id)}>
                      Toggle
                    </Button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={5}>
                    No staff records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentsPage({
  role,
  payments,
  staffById,
  onEdit,
  onDelete,
}: {
  role: Role
  payments: Payment[]
  staffById: Map<string, Staff>
  onEdit: (p: Payment) => void
  onDelete: (p: Payment) => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="text-base font-semibold text-slate-900">{role === 'owner' ? 'Payments Ledger' : 'Transactions'}</div>
        <div className="text-sm text-slate-500">{role === 'owner' ? 'Search, edit, delete, and attach receipts.' : 'You can only view your own transactions.'}</div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {role === 'owner' && <th className="px-3 py-2 text-left font-semibold text-slate-700">Staff</th>}
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Month earned</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Date sent</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Amount</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Method</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Category</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Receipt</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const s = staffById.get(p.staffId)
                return (
                  <tr key={p.id} className="border-t border-slate-200">
                    {role === 'owner' && (
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">{s?.fullName || 'Staff'}</div>
                        <div className="text-xs text-slate-500">{s?.jobTitle || ''}</div>
                      </td>
                    )}
                    <td className="px-3 py-2 text-slate-700">{monthLabel(p.monthEarned)}</td>
                    <td className="px-3 py-2 text-slate-500">{formatDate(p.dateSent)}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{formatMoney(p.amount, p.currency)}</td>
                    <td className="px-3 py-2 text-slate-700">{p.method}</td>
                    <td className="px-3 py-2">
                      <Pill>{p.category}</Pill>
                    </td>
                    <td className="px-3 py-2">
                      {p.receiptStatus === 'attached' ? (
                        <div className="flex flex-col gap-1">
                          <Pill tone="ok">Attached</Pill>
                          <div className="max-w-[240px] truncate text-xs text-slate-500">{p.receiptName || 'receipt'}</div>
                        </div>
                      ) : (
                        <Pill tone="warn">Missing</Pill>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {role === 'employee' ? (
                        <Button variant="outline" size="sm" disabled={p.receiptStatus !== 'attached'}>
                          ⬇ Receipt
                        </Button>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => onEdit(p)}>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => onDelete(p)}>
                            Delete
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {payments.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={role === 'owner' ? 8 : 7}>
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function AuditPage({ logs }: { logs: AuditLog[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-base font-semibold text-slate-900">Audit Log</div>
        <div className="text-sm text-slate-500">Every create/update/delete action is recorded here.</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((l) => (
            <div key={l.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-slate-900">{l.summary}</div>
                <Pill>{l.action.toUpperCase()}</Pill>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {formatDate(l.timestamp)} · Actor: {l.actor} · {l.entityType}:{l.entityId}
              </div>
            </div>
          ))}
          {logs.length === 0 && <div className="text-sm text-slate-500">No audit records.</div>}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------
// Modals
// ---------------------------

function PaymentModal({
  open,
  onClose,
  staff,
  staffById,
  editing,
  onCreate,
  onUpdate,
}: {
  open: boolean
  onClose: () => void
  staff: Staff[]
  staffById: Map<string, Staff>
  editing: Payment | null
  onCreate: (p: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (id: string, patch: Partial<Payment>) => void
}) {
  const isEdit = Boolean(editing)

  const [staffId, setStaffId] = useState(editing?.staffId || staff[0]?.id || '')
  const [monthEarned, setMonthEarned] = useState(editing?.monthEarned || '')
  const [dateSent, setDateSent] = useState(editing?.dateSent ? editing.dateSent.slice(0, 16) : '')
  const [amount, setAmount] = useState(editing?.amount ? String(editing.amount) : '')
  const [method, setMethod] = useState<PaymentMethod>(editing?.method || 'Wise')
  const [category, setCategory] = useState<PaymentCategory>(editing?.category || 'Salary')
  const [referenceId, setReferenceId] = useState(editing?.referenceId || '')
  const [notes, setNotes] = useState(editing?.notes || '')
  const [receiptStatus, setReceiptStatus] = useState<ReceiptStatus>(editing?.receiptStatus || 'missing')
  const [receiptName, setReceiptName] = useState(editing?.receiptName || '')

  useEffect(() => {
    if (editing) {
      setStaffId(editing.staffId)
      setMonthEarned(editing.monthEarned)
      setDateSent(editing.dateSent.slice(0, 16))
      setAmount(String(editing.amount))
      setMethod(editing.method)
      setCategory(editing.category)
      setReferenceId(editing.referenceId || '')
      setNotes(editing.notes || '')
      setReceiptStatus(editing.receiptStatus)
      setReceiptName(editing.receiptName || '')
    } else {
      setStaffId(staff[0]?.id || '')
      setMonthEarned('')
      setDateSent('')
      setAmount('')
      setMethod('Wise')
      setCategory('Salary')
      setReferenceId('')
      setNotes('')
      setReceiptStatus('missing')
      setReceiptName('')
    }
  }, [editing, staff])

  function handleSubmit() {
    if (!staffId || !monthEarned || !dateSent || !amount) return

    const paymentData = {
      staffId,
      monthEarned,
      dateSent: new Date(dateSent).toISOString(),
      amount: Number(amount),
      currency: 'USD' as const,
      method,
      category,
      referenceId: referenceId || undefined,
      notes: notes || undefined,
      receiptStatus,
      receiptName: receiptName || undefined,
    }

    if (isEdit && editing) {
      onUpdate(editing.id, paymentData)
    } else {
      onCreate(paymentData)
    }
    onClose()
  }

  return (
    <Modal open={open} title={isEdit ? 'Edit Payment' : 'Add Payment'} onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Staff</Label>
          <Select
            value={staffId}
            onChange={setStaffId}
            options={staff.map((s) => ({ label: `${s.fullName} (${s.jobTitle})`, value: s.id }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Month earned (YYYY-MM)</Label>
            <Input value={monthEarned} onChange={setMonthEarned} placeholder="2025-12" />
          </div>
          <div className="space-y-2">
            <Label>Date sent</Label>
            <Input type="datetime-local" value={dateSent} onChange={setDateSent} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <Input type="number" value={amount} onChange={setAmount} placeholder="1250.00" />
          </div>
          <div className="space-y-2">
            <Label>Method</Label>
            <Select
              value={method}
              onChange={(v) => setMethod(v as PaymentMethod)}
              options={[
                { label: 'Wise', value: 'Wise' },
                { label: 'Sendwave', value: 'Sendwave' },
                { label: 'WorldRemit', value: 'WorldRemit' },
              ]}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onChange={(v) => setCategory(v as PaymentCategory)}
              options={[
                { label: 'Salary', value: 'Salary' },
                { label: 'Bonus', value: 'Bonus' },
                { label: 'Reimbursement', value: 'Reimbursement' },
                { label: 'Other', value: 'Other' },
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label>Reference ID</Label>
            <Input value={referenceId} onChange={setReferenceId} placeholder="WISE-7H2K9Q" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment notes..."
            className="h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Receipt status</Label>
            <Select
              value={receiptStatus}
              onChange={(v) => setReceiptStatus(v as ReceiptStatus)}
              options={[
                { label: 'Attached', value: 'attached' },
                { label: 'Missing', value: 'missing' },
              ]}
            />
          </div>
          {receiptStatus === 'attached' && (
            <div className="space-y-2">
              <Label>Receipt name</Label>
              <Input value={receiptName} onChange={setReceiptName} placeholder="receipt.pdf" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!staffId || !monthEarned || !dateSent || !amount}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function StaffModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (s: Omit<Staff, 'id'>) => void
}) {
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  useEffect(() => {
    if (!open) {
      setFullName('')
      setJobTitle('')
      setEmail('')
      setStatus('active')
    }
  }, [open])

  function handleSubmit() {
    if (!fullName || !jobTitle) return
    onCreate({
      fullName,
      jobTitle,
      email: email || undefined,
      status,
    })
    onClose()
  }

  return (
    <Modal open={open} title="Add Staff" onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Full name</Label>
          <Input value={fullName} onChange={setFullName} placeholder="John Doe" />
        </div>

        <div className="space-y-2">
          <Label>Job title</Label>
          <Input value={jobTitle} onChange={setJobTitle} placeholder="Operations Manager" />
        </div>

        <div className="space-y-2">
          <Label>Email (optional)</Label>
          <Input type="email" value={email} onChange={setEmail} placeholder="john@company.com" />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={status}
            onChange={(v) => setStatus(v as 'active' | 'inactive')}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!fullName || !jobTitle}>
            Create
          </Button>
        </div>
      </div>
    </Modal>
  )
} 