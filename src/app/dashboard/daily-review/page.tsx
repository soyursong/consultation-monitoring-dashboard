"use client"

import { useMemo, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  generateDemoCalls, demoSalesReps, demoPackages,
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
  Phone, CreditCard, AlertCircle, Search, X, Save,
  CircleDot, Edit3,
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

// ─── Inline Editable Card ─────────────────────────────────────
interface InlineCardProps {
  call: Call
  onFieldChange: (id: string, field: string, value: unknown) => void
  onReviewToggle: (id: string) => void
  onOpenDetail: (call: Call) => void
  onOpenEdit: (call: Call) => void
}

function InlineEditCard({ call, onFieldChange, onReviewToggle, onOpenDetail, onOpenEdit }: InlineCardProps) {
  const [expanded, setExpanded] = useState(false)
  const rep = demoSalesReps.find((r) => r.id === call.sales_rep_id)

  const reviewStatus = call.review_status || "unreviewed"
  const ReviewIcon = reviewStatusIcons[reviewStatus]

  const borderColor = reviewStatus === "reviewed"
    ? "border-l-green-400"
    : reviewStatus === "needs_edit"
      ? "border-l-red-400"
      : "border-l-yellow-400"

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  return (
    <Card className={`transition-all hover:shadow-md border-l-4 ${borderColor}`}>
      <CardContent className="p-4">
        {/* ── 상단 요약 ── */}
        <div className="flex items-start justify-between cursor-pointer" onClick={handleToggleExpand}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-semibold">{call.customer_name}</span>
              <Badge variant="outline" className="text-[10px]">
                {patientTypeLabels[call.patient_type as PatientType]}
              </Badge>
              {call.referral_source && (
                <Badge variant="outline" className="text-[10px]">
                  {referralSourceLabels[call.referral_source as ReferralSource]}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{rep?.name}</span>
              {call.call_time && <span>{call.call_time}</span>}
              {call.package_name && <span className="truncate max-w-[150px]">{call.package_name}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 ml-4">
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className={statusColors[call.status as CallStatus] + " text-[10px]"}>
                {statusLabels[call.status as CallStatus]}
              </Badge>
              <Badge variant="secondary" className={paymentStatusColors[call.payment_status as PaymentStatus] + " text-[10px]"}>
                {paymentStatusLabels[call.payment_status as PaymentStatus]}
              </Badge>
            </div>
            {call.payment_amount > 0 && (
              <span className="text-sm font-medium">{formatKRW(call.payment_amount)}</span>
            )}
            {call.drop_reason && (
              <span className="text-xs text-red-500">{call.drop_reason}</span>
            )}
          </div>
        </div>

        {/* ── 인라인 편집 영역 (확장 시) ── */}
        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* 결제유무 */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">결제상태</label>
                <Select
                  value={call.payment_status}
                  onValueChange={(v) => onFieldChange(call.id, "payment_status", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(paymentStatusLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 채널구분 (유입경로) */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">채널구분</label>
                <Select
                  value={call.referral_source || "none"}
                  onValueChange={(v) => onFieldChange(call.id, "referral_source", v === "none" ? undefined : v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">미지정</SelectItem>
                    {Object.entries(referralSourceLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 유형구분 (신환/구환) */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">유형구분</label>
                <Select
                  value={call.patient_type}
                  onValueChange={(v) => onFieldChange(call.id, "patient_type", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(patientTypeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 결제금액 */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">결제금액</label>
                <Input
                  type="number"
                  min={0}
                  step={10000}
                  className="h-8 text-xs"
                  value={call.payment_amount || ""}
                  onChange={(e) => onFieldChange(call.id, "payment_amount", Number(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* 상담상태 */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">상담상태</label>
                <Select
                  value={call.status}
                  onValueChange={(v) => onFieldChange(call.id, "status", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 담당자 */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">담당자</label>
                <Select
                  value={call.sales_rep_id}
                  onValueChange={(v) => onFieldChange(call.id, "sales_rep_id", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {demoSalesReps.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 패키지 */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">패키지</label>
                <Select
                  value={call.package_name || "none"}
                  onValueChange={(v) => onFieldChange(call.id, "package_name", v === "none" ? undefined : v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">미지정</SelectItem>
                    {demoPackages.filter((p) => p.is_active).map((p) => (
                      <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 메모 간단 입력 */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">메모</label>
                <Input
                  className="h-8 text-xs"
                  value={call.notes || ""}
                  onChange={(e) => onFieldChange(call.id, "notes", e.target.value)}
                  placeholder="메모 입력..."
                />
              </div>
            </div>

            {/* 하단 전체수정 링크 */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onOpenEdit(call)}
              >
                <Edit3 className="h-3 w-3 mr-1" /> 전체 수정 (상세)
              </Button>
            </div>
          </div>
        )}

        {/* ── 하단 액션 바 ── */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 text-sm">
            <ReviewIcon className={`h-3.5 w-3.5 ${
              reviewStatus === "reviewed" ? "text-green-600" :
              reviewStatus === "needs_edit" ? "text-red-600" : "text-yellow-600"
            }`} />
            <Badge
              variant="secondary"
              className={`${reviewStatusColors[reviewStatus]} text-[10px] cursor-pointer select-none`}
              onClick={(e) => { e.stopPropagation(); onReviewToggle(call.id) }}
            >
              {reviewStatusLabels[reviewStatus]}
            </Badge>
          </div>
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => onOpenDetail(call)}
            >
              상세보기
            </Button>
            <Button
              variant={expanded ? "default" : "outline"}
              size="sm"
              className={`h-7 text-xs ${expanded ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
              onClick={handleToggleExpand}
            >
              {expanded ? <><Save className="h-3 w-3 mr-1" /> 접기</> : <><Edit3 className="h-3 w-3 mr-1" /> 빠른수정</>}
            </Button>
          </div>
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
              onOpenEdit={openEdit}
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
