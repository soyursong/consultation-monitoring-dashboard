"use client"

import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  generateDemoCalls, demoSalesReps,
  statusLabels, statusColors,
  paymentStatusLabels, paymentStatusColors,
  patientTypeLabels, referralSourceLabels,
  reviewStatusLabels, reviewStatusColors,
} from "@/lib/demo-data"
import { formatKRW } from "@/lib/format"
import { CallFormDialog } from "@/components/dashboard/call-form-dialog"
import { CallDetailSheet } from "@/components/dashboard/call-detail-sheet"
import {
  ChevronLeft, ChevronRight, Plus, CheckCircle, XCircle,
  Phone, CreditCard, AlertCircle, Search, X,
  CircleDot, ChevronDown,
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

// 리뷰 상태 순환: 미확인 → 확인 → 수정필요 → 미확인
const nextReviewStatus: Record<ReviewStatus, ReviewStatus> = {
  unreviewed: "reviewed",
  reviewed: "needs_edit",
  needs_edit: "unreviewed",
}

const reviewStatusIcons: Record<ReviewStatus, typeof CheckCircle> = {
  unreviewed: XCircle,
  reviewed: CheckCircle,
  needs_edit: CircleDot,
}

// ─── 클릭시 드롭다운 뱃지 ──────────────────────────────────────
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
        className={`${colorMap[value] || ""} text-[10px] cursor-pointer select-none hover:opacity-80 transition-opacity`}
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
      >
        {options[value] || value}
        <ChevronDown className="h-2.5 w-2.5 ml-0.5 opacity-60" />
      </Badge>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border rounded-md shadow-lg py-1 min-w-[90px]">
          {Object.entries(options).map(([k, label]) => (
            <button
              key={k}
              className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors ${k === value ? "font-semibold bg-gray-50" : ""}`}
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

// ─── 클릭시 인라인 숫자 편집 ────────────────────────────────────
function InlineAmount({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
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
        className="w-24 h-6 text-xs text-right border rounded px-1.5 outline-none focus:ring-1 focus:ring-emerald-500"
        placeholder="금액 입력"
      />
    )
  }

  return (
    <span
      className="text-sm font-medium cursor-pointer hover:bg-gray-100 rounded px-1.5 py-0.5 transition-colors border border-transparent hover:border-gray-300"
      onClick={startEdit}
      title="클릭하여 금액 수정"
    >
      {value > 0 ? formatKRW(value) : <span className="text-muted-foreground text-xs">금액입력</span>}
    </span>
  )
}

// ─── Inline Editable Card ─────────────────────────────────────
interface InlineCardProps {
  call: Call
  onFieldChange: (id: string, field: string, value: unknown) => void
  onReviewToggle: (id: string) => void
  onOpenDetail: (call: Call) => void
}

function InlineEditCard({ call, onFieldChange, onReviewToggle, onOpenDetail }: InlineCardProps) {
  const rep = demoSalesReps.find((r) => r.id === call.sales_rep_id)
  const reviewStatus = call.review_status || "unreviewed"
  const ReviewIcon = reviewStatusIcons[reviewStatus]

  const borderColor = reviewStatus === "reviewed"
    ? "border-l-green-400"
    : reviewStatus === "needs_edit"
      ? "border-l-red-400"
      : "border-l-yellow-400"

  return (
    <Card className={`transition-all hover:shadow-md border-l-4 ${borderColor}`}>
      <CardContent className="p-4">
        {/* ── 상단: 고객정보 + 클릭 가능한 뱃지들 ── */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-semibold">{call.customer_name}</span>
              {/* 유형구분: 클릭 → 드롭다운 */}
              <DropdownBadge
                value={call.patient_type as PatientType}
                options={patientTypeLabels}
                colorMap={{ new: "bg-blue-50 text-blue-700", returning: "bg-purple-50 text-purple-700" }}
                onChange={(v) => onFieldChange(call.id, "patient_type", v)}
              />
              {/* 채널구분: 클릭 → 드롭다운 */}
              <DropdownBadge
                value={call.referral_source as ReferralSource || "none" as string}
                options={{ none: "채널미정", ...referralSourceLabels }}
                colorMap={{ none: "bg-gray-100 text-gray-600", ad: "bg-orange-50 text-orange-700", organic: "bg-teal-50 text-teal-700" }}
                onChange={(v: string) => onFieldChange(call.id, "referral_source", v === "none" ? undefined : v)}
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{rep?.name}</span>
              {call.call_time && <span>{call.call_time}</span>}
              {call.package_name && <span className="truncate max-w-[150px]">{call.package_name}</span>}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 ml-4">
            {/* 상담상태 + 결제상태: 클릭 → 드롭다운 */}
            <div className="flex items-center gap-1.5">
              <DropdownBadge
                value={call.status as CallStatus}
                options={statusLabels}
                colorMap={statusColors}
                onChange={(v) => onFieldChange(call.id, "status", v)}
              />
              <DropdownBadge
                value={call.payment_status as PaymentStatus}
                options={paymentStatusLabels}
                colorMap={paymentStatusColors}
                onChange={(v) => onFieldChange(call.id, "payment_status", v)}
              />
            </div>
            {/* 결제금액: 클릭 → 인라인 입력 */}
            <InlineAmount
              value={call.payment_amount}
              onChange={(v) => onFieldChange(call.id, "payment_amount", v)}
            />
            {call.drop_reason && (
              <span className="text-xs text-red-500">{call.drop_reason}</span>
            )}
          </div>
        </div>

        {/* ── 하단 액션 바 ── */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          {/* 리뷰 상태: 클릭 → 토글 순환 */}
          <div
            className="flex items-center gap-1.5 cursor-pointer select-none"
            onClick={(e) => { e.stopPropagation(); onReviewToggle(call.id) }}
            title="클릭하여 상태 변경: 미확인 → 확인 → 수정필요"
          >
            <ReviewIcon className={`h-4 w-4 ${
              reviewStatus === "reviewed" ? "text-green-600" :
              reviewStatus === "needs_edit" ? "text-red-600" : "text-yellow-600"
            }`} />
            <Badge
              variant="secondary"
              className={`${reviewStatusColors[reviewStatus]} text-[11px] cursor-pointer`}
            >
              {reviewStatusLabels[reviewStatus]}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); onOpenDetail(call) }}
          >
            상세보기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ─────────────────────────────────────────────────
export default function DailyReviewPage() {
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()))
  const [calls, setCalls] = useState<Call[]>(() => generateDemoCalls())
  const [reviewFilter, setReviewFilter] = useState<string>("all")
  const [repFilter, setRepFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog / Sheet state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingCall, setEditingCall] = useState<Call | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailCall, setDetailCall] = useState<Call | null>(null)

  // Filter calls for the selected date
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

  // Stats
  const allDayCalls = useMemo(() => calls.filter((c) => c.call_date === currentDate && c.is_active), [calls, currentDate])
  const stats = useMemo(() => ({
    total: allDayCalls.length,
    reviewed: allDayCalls.filter((c) => c.review_status === "reviewed").length,
    unreviewed: allDayCalls.filter((c) => c.review_status === "unreviewed" || !c.review_status).length,
    needsEdit: allDayCalls.filter((c) => c.review_status === "needs_edit").length,
    paid: allDayCalls.filter((c) => c.payment_status === "paid" || c.payment_status === "partial").length,
  }), [allDayCalls])

  const navigateDate = (offset: number) => {
    const d = new Date(currentDate + "T00:00:00")
    d.setDate(d.getDate() + offset)
    setCurrentDate(formatDate(d))
  }

  // 리뷰 상태 토글 (3단계 순환)
  const handleReviewToggle = useCallback((id: string) => {
    setCalls((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const current = c.review_status || "unreviewed"
        const next = nextReviewStatus[current]
        return {
          ...c,
          review_status: next,
          is_confirmed: next === "reviewed",
        }
      })
    )
  }, [])

  // 인라인 필드 수정
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
    setCalls((prev) =>
      prev.map((c) => c.id === id ? { ...c, is_active: !c.is_active } : c)
    )
  }

  const handleCreate = (data: Partial<Call>) => {
    const newCall: Call = {
      id: `call-new-${Date.now()}`,
      center_id: "center-1",
      sales_rep_id: data.sales_rep_id!,
      customer_name: data.customer_name!,
      patient_type: data.patient_type || "new",
      referral_source: data.referral_source,
      package_name: data.package_name,
      call_date: data.call_date || currentDate,
      call_time: data.call_time,
      duration_seconds: data.duration_seconds || 0,
      status: data.status || "unconfirmed",
      payment_status: data.payment_status || "unpaid",
      payment_amount: data.payment_amount || 0,
      drop_reason: data.drop_reason,
      is_confirmed: data.is_confirmed || false,
      review_status: data.is_confirmed ? "reviewed" : "unreviewed",
      notes: data.notes,
      is_active: true,
      created_at: new Date().toISOString(),
      sales_rep: demoSalesReps.find((r) => r.id === data.sales_rep_id),
    }
    setCalls((prev) => [newCall, ...prev])
  }

  const handleUpdate = (data: Partial<Call>) => {
    if (!editingCall) return
    setCalls((prev) =>
      prev.map((c) => c.id === editingCall.id ? {
        ...c,
        ...data,
        sales_rep: demoSalesReps.find((r) => r.id === (data.sales_rep_id || c.sales_rep_id)),
      } : c)
    )
  }

  const openCreate = () => {
    setFormMode("create")
    setEditingCall(null)
    setFormOpen(true)
  }

  const openEdit = (call: Call) => {
    setFormMode("edit")
    setEditingCall(call)
    setFormOpen(true)
    setDetailOpen(false)
  }

  const openDetail = (call: Call) => {
    setDetailCall(call)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">일일 상담 확인</h1>
          <p className="text-sm text-muted-foreground">코디 데일리 워크스페이스</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-1" /> 신규 상담 입력
        </Button>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> 이전
            </Button>
            <div className="text-center">
              <p className="text-lg font-semibold">{formatDateDisplay(currentDate)}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateDate(1)}>
              다음 <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">총 상담</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.reviewed}</p>
              <p className="text-xs text-muted-foreground">확인</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.unreviewed}</p>
              <p className="text-xs text-muted-foreground">미확인</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <CircleDot className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.needsEdit}</p>
              <p className="text-xs text-muted-foreground">수정필요</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.paid}</p>
              <p className="text-xs text-muted-foreground">결제 건</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        {/* 검색창 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="고객이름, 상담실장, 패키지로 검색..."
            className="pl-9 pr-9 h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 필터 버튼 */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {[
              { value: "all", label: "전체", count: stats.total },
              { value: "unreviewed", label: "미확인", count: stats.unreviewed, color: "bg-yellow-100 text-yellow-800" },
              { value: "reviewed", label: "확인", count: stats.reviewed, color: "bg-green-100 text-green-800" },
              { value: "needs_edit", label: "수정필요", count: stats.needsEdit, color: "bg-red-100 text-red-800" },
            ].map((tab) => (
              <Button
                key={tab.value}
                variant={reviewFilter === tab.value ? "default" : "outline"}
                size="sm"
                onClick={() => setReviewFilter(tab.value)}
                className={reviewFilter === tab.value ? "bg-slate-900" : ""}
              >
                {tab.label}
                {tab.count > 0 && tab.value !== "all" && (
                  <Badge variant="secondary" className={`ml-1.5 text-[10px] px-1.5 ${tab.color || ""}`}>
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          <Select value={repFilter} onValueChange={setRepFilter}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue placeholder="전체 담당자" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 담당자</SelectItem>
              {demoSalesReps.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              검색결과: {dayCalls.length}건
            </span>
          )}
        </div>
      </div>

      {/* Card List */}
      <div className="space-y-3">
        {dayCalls.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {searchQuery
                ? `"${searchQuery}" 검색 결과가 없습니다.`
                : `${currentDate}에 해당하는 상담 데이터가 없습니다.`
              }
            </CardContent>
          </Card>
        ) : (
          dayCalls.map((call) => (
            <InlineEditCard
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
