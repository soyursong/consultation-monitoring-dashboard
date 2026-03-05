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
import { CallFormDialog } from "@/components/dashboard/call-form-dialog"
import { CallDetailSheet } from "@/components/dashboard/call-detail-sheet"
import {
  ChevronLeft, ChevronRight, Plus,
  Phone, CreditCard, Banknote,
  Search, X, ChevronDown,
  Clock, FileText, ArrowRight, CheckCircle2,
} from "lucide-react"
import type { Call, CallStatus, PaymentStatus, PatientType, ReferralSource, ReviewStatus } from "@/lib/types/database"

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  const days = ["일", "월", "화", "수", "목", "금", "토"]
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
}

// ─── Inline Dropdown Badge ─────────────────────────────────────
function DropdownBadge<T extends string>({
  value, options, colorMap, onChange,
}: {
  value: T; options: Record<string, string>; colorMap: Record<string, string>; onChange: (v: T) => void
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

  const commit = () => { onChange(Number(draft) || 0); setEditing(false) }

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
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select() }
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

// ─── Filter Chip ───────────────────────────────────────────────
function FilterChip({ label, active, onClick, count }: {
  label: string; active: boolean; onClick: () => void; count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
        active
          ? "bg-sky-500 text-white shadow-sm"
          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`text-[10px] px-1.5 py-0 rounded-full ${
          active ? "bg-white/20" : "bg-gray-100 text-gray-500"
        }`}>{count}</span>
      )}
    </button>
  )
}

// ─── Call Card Row ─────────────────────────────────────────────
function CallCardRow({
  call,
  onFieldChange,
  onReviewToggle,
  onOpenDetail,
}: {
  call: Call
  onFieldChange: (id: string, field: string, value: unknown) => void
  onReviewToggle: (id: string) => void
  onOpenDetail: (call: Call) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const rep = demoSalesReps.find((r) => r.id === call.sales_rep_id)
  const reviewStatus = call.review_status || "unreviewed"
  const durationMin = Math.floor(call.duration_seconds / 60)
  const durationSec = call.duration_seconds % 60

  // Score
  const score = useMemo(() => {
    let s = 70
    if (call.payment_status === "paid") s += 15
    else if (call.payment_status === "partial") s += 10
    if (call.status === "completed") s += 5
    if (call.payment_amount >= 300000) s += 5
    if (call.duration_seconds > 600) s += 5
    return Math.min(100, s)
  }, [call.payment_status, call.status, call.payment_amount, call.duration_seconds])

  return (
    <div className="border rounded-xl bg-white transition-all hover:shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Expand */}
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
        <div className="min-w-0 flex-shrink-0" style={{ width: "170px" }}>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm truncate">{call.customer_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
            <span>{rep?.name}</span>
            {call.call_time && <span>{call.call_time}</span>}
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
            <span className="truncate max-w-[180px] font-medium">{call.package_name}</span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
            <Clock className="h-3 w-3" />
            {durationMin}분 {durationSec > 0 ? `${String(durationSec).padStart(2, "0")}초` : "00초"}
          </span>
          {call.notes && <FileText className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          {call.drop_reason && (
            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{call.drop_reason}</span>
          )}

          <DropdownBadge
            value={reviewStatus}
            options={reviewStatusLabels}
            colorMap={reviewStatusColors}
            onChange={(v) => onFieldChange(call.id, "review_status", v)}
          />

          <InlineScore value={score} onChange={() => {}} />

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

          {/* Review circle toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); onReviewToggle(call.id) }}
            className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors ${
              reviewStatus === "reviewed" ? "bg-emerald-500 border-emerald-500" :
              reviewStatus === "needs_edit" ? "bg-red-400 border-red-400" :
              "border-gray-300 hover:border-gray-400"
            }`}
            title="확인 상태 토글"
          />

          <button
            onClick={(e) => { e.stopPropagation(); onOpenDetail(call) }}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
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

// ─── Review status cycling ─────────────────────────────────────
const nextReviewStatus: Record<ReviewStatus, ReviewStatus> = {
  unreviewed: "reviewed",
  reviewed: "needs_edit",
  needs_edit: "unreviewed",
}

// ─── Main Page ─────────────────────────────────────────────────
export default function DailyReviewPage() {
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()))
  const [calls, setCalls] = useState<Call[]>(() => generateDemoCalls())
  const [reviewFilter, setReviewFilter] = useState<string>("all")
  const [repFilter, setRepFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingCall, setEditingCall] = useState<Call | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailCall, setDetailCall] = useState<Call | null>(null)

  const dayCalls = useMemo(() => {
    return calls
      .filter((c) => c.call_date === currentDate && c.is_active)
      .filter((c) => {
        if (reviewFilter === "reviewed") return c.review_status === "reviewed"
        if (reviewFilter === "unreviewed") return c.review_status === "unreviewed" || !c.review_status
        if (reviewFilter === "needs_edit") return c.review_status === "needs_edit"
        return true
      })
      .filter((c) => repFilter === "all" || c.sales_rep_id === repFilter)
      .filter((c) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.trim().toLowerCase()
        const rep = demoSalesReps.find((r) => r.id === c.sales_rep_id)
        return (
          c.customer_name.toLowerCase().includes(q) ||
          (rep?.name || "").toLowerCase().includes(q) ||
          (c.package_name || "").toLowerCase().includes(q)
        )
      })
      .sort((a, b) => (b.call_time || "").localeCompare(a.call_time || ""))
  }, [calls, currentDate, reviewFilter, repFilter, searchQuery])

  const allDayCalls = useMemo(() => calls.filter((c) => c.call_date === currentDate && c.is_active), [calls, currentDate])
  const stats = useMemo(() => ({
    total: allDayCalls.length,
    reviewed: allDayCalls.filter((c) => c.review_status === "reviewed").length,
    unreviewed: allDayCalls.filter((c) => c.review_status === "unreviewed" || !c.review_status).length,
    needsEdit: allDayCalls.filter((c) => c.review_status === "needs_edit").length,
    paid: allDayCalls.filter((c) => c.payment_status === "paid" || c.payment_status === "partial").length,
    totalAmount: allDayCalls.filter(c => c.payment_amount > 0).reduce((sum, c) => sum + c.payment_amount, 0),
  }), [allDayCalls])

  const navigateDate = (offset: number) => {
    const d = new Date(currentDate + "T00:00:00")
    d.setDate(d.getDate() + offset)
    setCurrentDate(formatDate(d))
  }

  const handleReviewToggle = useCallback((id: string) => {
    setCalls((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const current = c.review_status || "unreviewed"
        const next = nextReviewStatus[current]
        return { ...c, review_status: next, is_confirmed: next === "reviewed" }
      })
    )
  }, [])

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

  const handleToggleActive = (id: string) => {
    setCalls((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !c.is_active } : c))
  }

  const handleCreate = (data: Partial<Call>) => {
    const newCall: Call = {
      id: `call-new-${Date.now()}`, center_id: "center-1",
      sales_rep_id: data.sales_rep_id!, customer_name: data.customer_name!,
      patient_type: data.patient_type || "new", referral_source: data.referral_source,
      package_name: data.package_name, call_date: data.call_date || currentDate,
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

  const openCreate = () => { setFormMode("create"); setEditingCall(null); setFormOpen(true) }
  const openEdit = (call: Call) => { setFormMode("edit"); setEditingCall(call); setFormOpen(true); setDetailOpen(false) }
  const openDetail = (call: Call) => { setDetailCall(call); setDetailOpen(true) }

  // Progress bar
  const reviewProgress = stats.total > 0 ? Math.round((stats.reviewed / stats.total) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">일일 상담 확인</h1>
          <p className="text-sm text-gray-500 mt-0.5">코디 데일리 워크스페이스</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 rounded-lg h-9 px-4 text-sm">
          <Plus className="h-4 w-4 mr-1.5" /> 신규 상담 입력
        </Button>
      </div>

      {/* Date Navigation + Progress */}
      <div className="flex items-center gap-4 bg-white rounded-xl border p-4">
        <Button variant="outline" size="sm" onClick={() => navigateDate(-1)} className="rounded-lg h-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 text-center">
          <p className="text-lg font-semibold tracking-tight">{formatDateDisplay(currentDate)}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigateDate(1)} className="rounded-lg h-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-xl border bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
            <Phone className="h-5 w-5 text-gray-500" />
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

      {/* Review Progress */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">확인 진행률</span>
            <span className="text-gray-400">{stats.reviewed}/{stats.total}건 완료</span>
          </div>
          <span className="text-sm font-semibold text-emerald-600">{reviewProgress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${reviewProgress}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Review status filter */}
        <div className="flex gap-1.5">
          {[
            { value: "all", label: "전체", count: stats.total },
            { value: "unreviewed", label: "미확인", count: stats.unreviewed },
            { value: "reviewed", label: "확인", count: stats.reviewed },
            { value: "needs_edit", label: "수정필요", count: stats.needsEdit },
          ].map((tab) => (
            <FilterChip
              key={tab.value}
              label={tab.label}
              active={reviewFilter === tab.value}
              onClick={() => setReviewFilter(tab.value)}
              count={tab.value !== "all" ? tab.count : undefined}
            />
          ))}
        </div>

        {/* Rep filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">담당자:</span>
          <div className="relative inline-block">
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
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

        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="고객이름, 상담실장, 패키지 검색..."
            className="pl-9 pr-9 h-9 w-64 rounded-lg border-gray-200 bg-gray-50 focus:bg-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Card List */}
      <div className="space-y-2">
        {dayCalls.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border rounded-xl bg-white">
            {searchQuery
              ? `"${searchQuery}" 검색 결과가 없습니다.`
              : `${currentDate}에 해당하는 상담 데이터가 없습니다.`
            }
          </div>
        ) : (
          dayCalls.map((call) => (
            <CallCardRow
              key={call.id}
              call={call}
              onFieldChange={handleFieldChange}
              onReviewToggle={handleReviewToggle}
              onOpenDetail={openDetail}
            />
          ))
        )}
      </div>

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
