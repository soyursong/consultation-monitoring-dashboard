"use client"

import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  generateDemoCalls, demoSalesReps,
  statusLabels, statusColors,
  paymentStatusLabels, paymentStatusColors,
  patientTypeLabels, referralSourceLabels,
  reviewStatusLabels, reviewStatusColors,
  dropReasons,
} from "@/lib/demo-data"
// formatKRW used by InlineAmount indirectly
import { CallFormDialog } from "@/components/dashboard/call-form-dialog"
import { CallDetailSheet } from "@/components/dashboard/call-detail-sheet"
import {
  Plus, Search, ChevronDown, ChevronRight,
  MessageSquare, CreditCard, Banknote,
  Clock, FileText, ArrowRight, X, Calendar,
  ChevronLeft,
} from "lucide-react"
import type { Call, CallStatus, PaymentStatus, PatientType, ReferralSource, ReviewStatus } from "@/lib/types/database"

// ─── Inline Dropdown Badge ─────────────────────────────────────
function DropdownBadge<T extends string>({
  value,
  options,
  colorMap,
  onChange,
}: {
  value: T
  options: Record<string, string>
  colorMap: Record<string, string>
  onChange: (v: T) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div className="relative inline-block" ref={ref}>
      <Badge
        variant="secondary"
        className={`${colorMap[value] || ""} text-[11px] cursor-pointer select-none hover:opacity-80 transition-opacity px-2 py-0.5`}
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
      >
        {options[value] || value}
        <ChevronDown className="h-2.5 w-2.5 ml-0.5 opacity-60" />
      </Badge>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[100px]">
          {Object.entries(options).map(([k, label]) => (
            <button
              key={k}
              className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${k === value ? "font-semibold bg-gray-50" : ""}`}
              onClick={(e) => { e.stopPropagation(); onChange(k as T); setOpen(false) }}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${(colorMap[k] || "").split(" ")[0]}`} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Inline Amount Editor ──────────────────────────────────────
function InlineAmount({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDraft(value > 0 ? String(value) : "")
    setEditing(true)
  }

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const commit = () => {
    onChange(Number(draft) || 0)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        step={10000}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false) }}
        onClick={(e) => e.stopPropagation()}
        className="w-28 h-7 text-sm text-right border rounded-lg px-2 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        placeholder="금액 입력"
      />
    )
  }

  return (
    <span
      className="text-sm font-semibold cursor-pointer hover:bg-gray-100 rounded-md px-1.5 py-0.5 transition-colors tabular-nums"
      onClick={startEdit}
      title="클릭하여 금액 수정"
    >
      {value > 0 ? `${value.toLocaleString()}원` : <span className="text-gray-400 font-normal">0원</span>}
    </span>
  )
}

// ─── Inline Score Editor ───────────────────────────────────────
function InlineScore({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDraft(String(value))
    setEditing(true)
  }

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = () => {
    const n = Math.min(100, Math.max(0, Number(draft) || 0))
    onChange(n)
    setEditing(false)
  }

  const scoreColor = value >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : value >= 80 ? "bg-blue-50 text-blue-700 border-blue-200"
    : value >= 70 ? "bg-yellow-50 text-yellow-700 border-yellow-200"
    : "bg-red-50 text-red-700 border-red-200"

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        max={100}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false) }}
        onClick={(e) => e.stopPropagation()}
        className="w-14 h-9 text-center text-lg font-bold border-2 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
      />
    )
  }

  return (
    <button
      onClick={startEdit}
      className={`w-12 h-9 flex items-center justify-center rounded-xl border text-lg font-bold cursor-pointer hover:shadow-md transition-all ${scoreColor}`}
      title="클릭하여 점수 수정"
    >
      {value}
    </button>
  )
}

// ─── Filter Chip Button ────────────────────────────────────────
function FilterChip({ label, active, onClick, color }: {
  label: string; active: boolean; onClick: () => void; color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? color || "bg-sky-500 text-white shadow-sm"
          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  )
}

// ─── Expandable Call Row ───────────────────────────────────────
function CallRow({
  call,
  onFieldChange,
  onOpenDetail,
}: {
  call: Call
  onFieldChange: (id: string, field: string, value: unknown) => void
  onOpenDetail: (call: Call) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const rep = demoSalesReps.find((r) => r.id === call.sales_rep_id)
  const durationMin = Math.floor(call.duration_seconds / 60)
  const durationSec = call.duration_seconds % 60

  // Derive a "score" from various factors for display
  const score = useMemo(() => {
    let s = 70
    if (call.payment_status === "paid") s += 15
    else if (call.payment_status === "partial") s += 10
    if (call.status === "completed") s += 5
    if (call.payment_amount >= 300000) s += 5
    if (call.duration_seconds > 600) s += 5
    return Math.min(100, s)
  }, [call.payment_status, call.status, call.payment_amount, call.duration_seconds])

  const reviewStatus = call.review_status || "unreviewed"

  return (
    <div className={`border rounded-xl bg-white transition-all hover:shadow-sm ${!call.is_active ? "opacity-50" : ""}`}>
      {/* Main Row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-0" : "-rotate-90"}`} />
        </button>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600 flex-shrink-0">
          {(call.customer_name || "?")[0]}
        </div>

        {/* Customer info */}
        <div className="min-w-0 flex-shrink-0" style={{ width: "180px" }}>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm truncate">{call.customer_name}</span>
            {call.hospital_name && (
              <span className="text-xs text-gray-400 truncate">· {call.hospital_name}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
            <span>{rep?.name}</span>
            <span>{call.call_date.slice(5)} {call.call_time && `오후 ${call.call_time}`}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <DropdownBadge
            value={call.patient_type as PatientType}
            options={patientTypeLabels}
            colorMap={{ new: "bg-sky-100 text-sky-700", returning: "bg-emerald-100 text-emerald-700" }}
            onChange={(v) => onFieldChange(call.id, "patient_type", v)}
          />
          <DropdownBadge
            value={call.referral_source as ReferralSource || "organic"}
            options={{ ...referralSourceLabels, none: "미정" }}
            colorMap={{ ad: "bg-gray-200 text-gray-700", organic: "bg-gray-200 text-gray-700", none: "bg-gray-100 text-gray-500" }}
            onChange={(v: string) => onFieldChange(call.id, "referral_source", v === "none" ? undefined : v)}
          />
        </div>

        {/* Package & Duration */}
        <div className="flex items-center gap-3 text-sm text-gray-600 flex-1 min-w-0 ml-2">
          {call.package_name && (
            <span className="truncate max-w-[200px] font-medium">{call.package_name}</span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
            <Clock className="h-3 w-3" />
            {durationMin}분 {durationSec > 0 ? `${String(durationSec).padStart(2, "0")}초` : "00초"}
          </span>
          {call.notes && (
            <FileText className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
          )}
        </div>

        {/* Right side: Review + Score + Payment + Actions */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          {/* Drop reason tag */}
          {call.drop_reason && (
            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{call.drop_reason}</span>
          )}

          {/* Review status dropdown */}
          <DropdownBadge
            value={reviewStatus}
            options={reviewStatusLabels}
            colorMap={reviewStatusColors}
            onChange={(v) => onFieldChange(call.id, "review_status", v)}
          />

          {/* Score */}
          <InlineScore
            value={score}
            onChange={() => {}}
          />

          {/* Payment */}
          <div className="flex items-center gap-2 min-w-[140px] justify-end">
            <DropdownBadge
              value={call.payment_status as PaymentStatus}
              options={paymentStatusLabels}
              colorMap={paymentStatusColors}
              onChange={(v) => onFieldChange(call.id, "payment_status", v)}
            />
            <InlineAmount
              value={call.payment_amount}
              onChange={(v) => onFieldChange(call.id, "payment_amount", v)}
            />
          </div>

          {/* Review circle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              const next: Record<ReviewStatus, ReviewStatus> = {
                unreviewed: "reviewed", reviewed: "needs_edit", needs_edit: "unreviewed"
              }
              onFieldChange(call.id, "review_status", next[reviewStatus])
            }}
            className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors ${
              reviewStatus === "reviewed" ? "bg-emerald-500 border-emerald-500" :
              reviewStatus === "needs_edit" ? "bg-red-400 border-red-400" :
              "border-gray-300 hover:border-gray-400"
            }`}
            title="확인 상태 토글"
          />

          {/* Detail arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); onOpenDetail(call) }}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t px-4 py-3 bg-gray-50/50 rounded-b-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-400 block mb-1">상담 상태</span>
              <DropdownBadge
                value={call.status as CallStatus}
                options={statusLabels}
                colorMap={statusColors}
                onChange={(v) => onFieldChange(call.id, "status", v)}
              />
            </div>
            <div>
              <span className="text-xs text-gray-400 block mb-1">담당자</span>
              <span className="font-medium">{rep?.name} <span className="text-gray-400 text-xs">{rep?.position}</span></span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block mb-1">통화 시간</span>
              <span>{durationMin}분 {durationSec > 0 ? `${durationSec}초` : ""}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block mb-1">이탈 사유</span>
              <DropdownBadge
                value={call.drop_reason || "none"}
                options={{ none: "없음", ...Object.fromEntries(dropReasons.map(r => [r, r])) }}
                colorMap={{ none: "bg-gray-100 text-gray-500", ...Object.fromEntries(dropReasons.map(r => [r, "bg-red-50 text-red-700"])) }}
                onChange={(v: string) => onFieldChange(call.id, "drop_reason", v === "none" ? null : v)}
              />
            </div>
          </div>
          {call.notes && (
            <div className="mt-3 text-sm text-gray-500 bg-white rounded-lg p-2.5 border">
              {call.notes}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Date Helpers ──────────────────────────────────────────────
function getToday() { return new Date().toISOString().split("T")[0] }
function getDateOffset(days: number) {
  const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split("T")[0]
}
function getWeekStart() {
  const d = new Date(); const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); return d.toISOString().split("T")[0]
}
function getMonthStart() {
  const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}

const PAGE_SIZES = [15, 30, 50]
type DatePreset = "today" | "yesterday" | "week" | "month" | "all" | "custom"

// ─── Main Page ─────────────────────────────────────────────────
export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>(() => generateDemoCalls())
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [patientFilter, setPatientFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [repFilter, setRepFilter] = useState<string>("all")
  const [activeFilter] = useState<string>("active")
  const [datePreset, setDatePreset] = useState<DatePreset>("month")
  const [dateFrom, setDateFrom] = useState(getMonthStart())
  const [dateTo, setDateTo] = useState(getToday())
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(30)

  // Dialog / Sheet state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingCall, setEditingCall] = useState<Call | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailCall, setDetailCall] = useState<Call | null>(null)

  const applyDatePreset = (preset: DatePreset) => {
    setDatePreset(preset); setPage(0)
    switch (preset) {
      case "today": setDateFrom(getToday()); setDateTo(getToday()); break
      case "yesterday": setDateFrom(getDateOffset(-1)); setDateTo(getDateOffset(-1)); break
      case "week": setDateFrom(getWeekStart()); setDateTo(getToday()); break
      case "month": setDateFrom(getMonthStart()); setDateTo(getToday()); break
      case "all": setDateFrom(""); setDateTo(""); break
    }
  }

  const filtered = useMemo(() => {
    return calls.filter((c) => {
      if (activeFilter === "active" && !c.is_active) return false
      if (dateFrom && c.call_date < dateFrom) return false
      if (dateTo && c.call_date > dateTo) return false
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (patientFilter !== "all" && c.patient_type !== patientFilter) return false
      if (paymentFilter !== "all" && c.payment_status !== paymentFilter) return false
      if (repFilter !== "all" && c.sales_rep_id !== repFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const rep = demoSalesReps.find((r) => r.id === c.sales_rep_id)
        if (!rep?.name.toLowerCase().includes(q) && !c.customer_name.toLowerCase().includes(q) && !c.package_name?.toLowerCase().includes(q))
          return false
      }
      return true
    }).sort((a, b) => b.call_date.localeCompare(a.call_date) || (b.call_time || "").localeCompare(a.call_time || ""))
  }, [calls, statusFilter, patientFilter, paymentFilter, repFilter, activeFilter, search, dateFrom, dateTo])

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  // Stats
  const stats = useMemo(() => ({
    total: filtered.length,
    paid: filtered.filter((c) => c.payment_status === "paid" || c.payment_status === "partial").length,
    totalAmount: filtered.filter(c => c.payment_amount > 0).reduce((sum, c) => sum + c.payment_amount, 0),
  }), [filtered])

  // Field change handler
  const handleFieldChange = useCallback((id: string, field: string, value: unknown) => {
    setCalls((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const updated = { ...c, [field]: value }
        if (field === "sales_rep_id") {
          updated.sales_rep = demoSalesReps.find((r) => r.id === value as string)
        }
        return updated
      })
    )
  }, [])

  // CRUD handlers
  const handleCreate = (data: Partial<Call>) => {
    const newCall: Call = {
      id: `call-new-${Date.now()}`, center_id: "center-1",
      sales_rep_id: data.sales_rep_id!, customer_name: data.customer_name!,
      patient_type: data.patient_type || "new", referral_source: data.referral_source,
      package_name: data.package_name, call_date: data.call_date || getToday(),
      call_time: data.call_time, duration_seconds: data.duration_seconds || 0,
      status: data.status || "unconfirmed", payment_status: data.payment_status || "unpaid",
      payment_amount: data.payment_amount || 0, drop_reason: data.drop_reason,
      is_confirmed: data.is_confirmed || false,
      review_status: data.is_confirmed ? "reviewed" : "unreviewed",
      notes: data.notes, is_active: true, created_at: new Date().toISOString(),
      sales_rep: demoSalesReps.find((r) => r.id === data.sales_rep_id),
    }
    setCalls((prev) => [newCall, ...prev])
  }

  const handleUpdate = (data: Partial<Call>) => {
    if (!editingCall) return
    setCalls((prev) =>
      prev.map((c) => c.id === editingCall.id ? {
        ...c, ...data,
        sales_rep: demoSalesReps.find((r) => r.id === (data.sales_rep_id || c.sales_rep_id)),
      } : c)
    )
  }

  const handleToggleActive = (id: string) => {
    setCalls((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !c.is_active } : c))
  }

  const openCreate = () => { setFormMode("create"); setEditingCall(null); setFormOpen(true) }
  const openEdit = (call: Call) => { setFormMode("edit"); setEditingCall(call); setFormOpen(true); setDetailOpen(false) }
  const openDetail = (call: Call) => { setDetailCall(call); setDetailOpen(true) }

  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const start = Math.max(0, Math.min(page - 2, totalPages - 5))
    const end = Math.min(totalPages, start + 5)
    for (let i = start; i < end; i++) pages.push(i)
    return pages
  }, [page, totalPages])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">상담 기록</h1>
          <p className="text-sm text-gray-500 mt-0.5">모든 대면상담 내역을 확인하고 점검하세요</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 rounded-lg h-9 px-4 text-sm">
          <Plus className="h-4 w-4 mr-1.5" /> 상담 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 py-2">
        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            상태:
          </span>
          <div className="flex gap-1.5">
            {[
              { value: "all", label: "전체" },
              { value: "completed", label: "완료" },
              { value: "in_progress", label: "진행중" },
              { value: "unconfirmed", label: "미확인" },
            ].map((f) => (
              <FilterChip key={f.value} label={f.label} active={statusFilter === f.value} onClick={() => { setStatusFilter(f.value); setPage(0) }} />
            ))}
          </div>
        </div>

        {/* Patient type filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">고객:</span>
          <div className="flex gap-1.5">
            {[
              { value: "all", label: "전체" },
              { value: "new", label: "신환" },
              { value: "returning", label: "구환" },
            ].map((f) => (
              <FilterChip
                key={f.value}
                label={f.label}
                active={patientFilter === f.value}
                onClick={() => { setPatientFilter(f.value); setPage(0) }}
                color={patientFilter === f.value ? "bg-emerald-500 text-white shadow-sm" : undefined}
              />
            ))}
          </div>
        </div>

        {/* Payment filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">결제:</span>
          <div className="flex gap-1.5">
            {[
              { value: "all", label: "전체" },
              { value: "paid", label: "완료" },
              { value: "unpaid", label: "미결제" },
              { value: "partial", label: "부분" },
            ].map((f) => (
              <FilterChip key={f.value} label={f.label} active={paymentFilter === f.value} onClick={() => { setPaymentFilter(f.value); setPage(0) }} />
            ))}
          </div>
        </div>

        {/* Rep filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">담당자:</span>
          <div className="relative inline-block">
            <select
              value={repFilter}
              onChange={(e) => { setRepFilter(e.target.value); setPage(0) }}
              className="appearance-none bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-sm pr-7 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">전체</option>
              {demoSalesReps.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <div className="flex gap-1.5">
            {([
              ["today", "오늘"], ["week", "이번주"], ["month", "이번달"], ["all", "전체"],
            ] as [DatePreset, string][]).map(([key, label]) => (
              <FilterChip key={key} label={label} active={datePreset === key} onClick={() => applyDatePreset(key)} />
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="이름, 회사명 검색..."
            className="pl-9 pr-9 h-9 w-64 rounded-lg border-gray-200 bg-gray-50 focus:bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-xl border bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
            <MessageSquare className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">상담 건수</p>
            <p className="text-2xl font-bold tracking-tight">{stats.total}<span className="text-sm font-normal text-gray-400 ml-0.5">건</span></p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <CreditCard className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">결제 건수</p>
            <p className="text-2xl font-bold tracking-tight">{stats.paid}<span className="text-sm font-normal text-gray-400 ml-0.5">건</span></p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
            <Banknote className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">결제 금액</p>
            <p className="text-2xl font-bold tracking-tight">{stats.totalAmount.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-0.5">원</span></p>
          </div>
        </div>
      </div>

      {/* Call List */}
      <div className="space-y-2">
        {paged.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border rounded-xl bg-white">
            조건에 맞는 상담 데이터가 없습니다.
          </div>
        ) : (
          paged.map((call) => (
            <CallRow
              key={call.id}
              call={call}
              onFieldChange={handleFieldChange}
              onOpenDetail={openDetail}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-400">
              {filtered.length > 0 ? `${page * pageSize + 1}-${Math.min((page + 1) * pageSize, filtered.length)}` : "0"} / {filtered.length}건
            </p>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
              className="text-xs border rounded-lg px-2 py-1.5 bg-white cursor-pointer"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}건</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 p-0 text-xs rounded-lg ${p === page ? "bg-slate-900" : ""}`}
                onClick={() => setPage(p)}
              >
                {p + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CallFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        call={editingCall}
        onSubmit={formMode === "create" ? handleCreate : handleUpdate}
      />
      <CallDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        call={detailCall}
        onEdit={openEdit}
        onToggleActive={handleToggleActive}
      />
    </div>
  )
}
