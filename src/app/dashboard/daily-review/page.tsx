"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  generateDemoCalls, demoSalesReps,
  statusLabels, statusColors,
  paymentStatusLabels, paymentStatusColors,
  patientTypeLabels, referralSourceLabels,
} from "@/lib/demo-data"
import { formatKRW } from "@/lib/format"
import { CallFormDialog } from "@/components/dashboard/call-form-dialog"
import { CallDetailSheet } from "@/components/dashboard/call-detail-sheet"
import {
  ChevronLeft, ChevronRight, Plus, CheckCircle, XCircle,
  Phone, CreditCard, AlertCircle,
} from "lucide-react"
import type { Call, CallStatus, PaymentStatus, PatientType, ReferralSource } from "@/lib/types/database"

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  const days = ["일", "월", "화", "수", "목", "금", "토"]
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
}

export default function DailyReviewPage() {
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()))
  const [calls, setCalls] = useState<Call[]>(() => generateDemoCalls())
  const [confirmFilter, setConfirmFilter] = useState<string>("all")
  const [repFilter, setRepFilter] = useState<string>("all")

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
        if (confirmFilter === "confirmed" && !c.is_confirmed) return false
        if (confirmFilter === "unconfirmed" && c.is_confirmed) return false
        return true
      })
      .filter((c) => repFilter === "all" || c.sales_rep_id === repFilter)
      .sort((a, b) => (b.call_time || "").localeCompare(a.call_time || ""))
  }, [calls, currentDate, confirmFilter, repFilter])

  // Stats
  const allDayCalls = useMemo(() => calls.filter((c) => c.call_date === currentDate && c.is_active), [calls, currentDate])
  const stats = useMemo(() => ({
    total: allDayCalls.length,
    confirmed: allDayCalls.filter((c) => c.is_confirmed).length,
    unconfirmed: allDayCalls.filter((c) => !c.is_confirmed).length,
    paid: allDayCalls.filter((c) => c.payment_status === "paid" || c.payment_status === "partial").length,
  }), [allDayCalls])

  const navigateDate = (offset: number) => {
    const d = new Date(currentDate + "T00:00:00")
    d.setDate(d.getDate() + offset)
    setCurrentDate(formatDate(d))
  }

  const handleConfirmToggle = (id: string) => {
    setCalls((prev) =>
      prev.map((c) => c.id === id ? { ...c, is_confirmed: !c.is_confirmed } : c)
    )
  }

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              <p className="text-2xl font-bold">{stats.confirmed}</p>
              <p className="text-xs text-muted-foreground">확인 완료</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.unconfirmed}</p>
              <p className="text-xs text-muted-foreground">미확인</p>
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {[
            { value: "all", label: "전체" },
            { value: "unconfirmed", label: "미확인" },
            { value: "confirmed", label: "확인완료" },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={confirmFilter === tab.value ? "default" : "outline"}
              size="sm"
              onClick={() => setConfirmFilter(tab.value)}
              className={confirmFilter === tab.value ? "bg-slate-900" : ""}
            >
              {tab.label}
              {tab.value === "unconfirmed" && stats.unconfirmed > 0 && (
                <Badge variant="secondary" className="ml-1.5 bg-yellow-100 text-yellow-800 text-[10px] px-1.5">
                  {stats.unconfirmed}
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
      </div>

      {/* Card List */}
      <div className="space-y-3">
        {dayCalls.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {currentDate}에 해당하는 상담 데이터가 없습니다.
            </CardContent>
          </Card>
        ) : (
          dayCalls.map((call) => {
            const rep = demoSalesReps.find((r) => r.id === call.sales_rep_id)
            return (
              <Card
                key={call.id}
                className={`cursor-pointer transition-all hover:shadow-md ${!call.is_confirmed ? "border-l-4 border-l-yellow-400" : "border-l-4 border-l-green-400"}`}
                onClick={() => openDetail(call)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
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

                  {/* Actions row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm">
                      {call.is_confirmed ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3.5 w-3.5" /> 확인 완료
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <XCircle className="h-3.5 w-3.5" /> 미확인
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant={call.is_confirmed ? "outline" : "default"}
                        size="sm"
                        className={`h-7 text-xs ${!call.is_confirmed ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                        onClick={() => handleConfirmToggle(call.id)}
                      >
                        {call.is_confirmed ? "확인 취소" : "확인"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => openEdit(call)}
                      >
                        수정
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
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
