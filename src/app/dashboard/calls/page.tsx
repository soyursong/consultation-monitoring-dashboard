"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  generateDemoCalls, demoSalesReps, statusLabels, statusColors,
  paymentStatusLabels, paymentStatusColors, patientTypeLabels,
} from "@/lib/demo-data"
import { formatKRW } from "@/lib/format"
import { CallFormDialog } from "@/components/dashboard/call-form-dialog"
import { CallDetailSheet } from "@/components/dashboard/call-detail-sheet"
import {
  Search, ChevronLeft, ChevronRight, Plus,
  MoreHorizontal, Eye, Pencil, PowerOff, Power,
} from "lucide-react"
import type { Call, CallStatus, PaymentStatus, PatientType } from "@/lib/types/database"

const PAGE_SIZES = [15, 30, 50]

function getToday() {
  return new Date().toISOString().split("T")[0]
}

function getDateOffset(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

function getWeekStart() {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d.toISOString().split("T")[0]
}

function getMonthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}

type DatePreset = "today" | "yesterday" | "week" | "month" | "all" | "custom"

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>(() => generateDemoCalls())
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [patientFilter, setPatientFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [repFilter, setRepFilter] = useState<string>("all")
  const [activeFilter, setActiveFilter] = useState<string>("active")
  const [datePreset, setDatePreset] = useState<DatePreset>("today")
  const [dateFrom, setDateFrom] = useState(getToday())
  const [dateTo, setDateTo] = useState(getToday())
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(15)

  // Dialog / Sheet state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingCall, setEditingCall] = useState<Call | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailCall, setDetailCall] = useState<Call | null>(null)

  const applyDatePreset = (preset: DatePreset) => {
    setDatePreset(preset)
    setPage(0)
    switch (preset) {
      case "today":
        setDateFrom(getToday()); setDateTo(getToday()); break
      case "yesterday":
        setDateFrom(getDateOffset(-1)); setDateTo(getDateOffset(-1)); break
      case "week":
        setDateFrom(getWeekStart()); setDateTo(getToday()); break
      case "month":
        setDateFrom(getMonthStart()); setDateTo(getToday()); break
      case "all":
        setDateFrom(""); setDateTo(""); break
    }
  }

  const filtered = useMemo(() => {
    return calls.filter((c) => {
      // Active filter
      if (activeFilter === "active" && !c.is_active) return false
      if (activeFilter === "inactive" && c.is_active) return false
      // Date filter
      if (dateFrom && c.call_date < dateFrom) return false
      if (dateTo && c.call_date > dateTo) return false
      // Other filters
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (patientFilter !== "all" && c.patient_type !== patientFilter) return false
      if (paymentFilter !== "all" && c.payment_status !== paymentFilter) return false
      if (repFilter !== "all" && c.sales_rep_id !== repFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const rep = demoSalesReps.find((r) => r.id === c.sales_rep_id)
        const matchRep = rep?.name.toLowerCase().includes(q)
        const matchCustomer = c.customer_name.toLowerCase().includes(q)
        const matchPkg = c.package_name?.toLowerCase().includes(q)
        if (!matchRep && !matchCustomer && !matchPkg) return false
      }
      return true
    }).sort((a, b) => b.call_date.localeCompare(a.call_date) || (b.call_time || "").localeCompare(a.call_time || ""))
  }, [calls, statusFilter, patientFilter, paymentFilter, repFilter, activeFilter, search, dateFrom, dateTo])

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  // CRUD handlers
  const handleCreate = (data: Partial<Call>) => {
    const newCall: Call = {
      id: `call-new-${Date.now()}`,
      center_id: "center-1",
      sales_rep_id: data.sales_rep_id!,
      customer_name: data.customer_name!,
      patient_type: data.patient_type || "new",
      referral_source: data.referral_source,
      package_name: data.package_name,
      call_date: data.call_date || getToday(),
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

  const handleToggleActive = (id: string) => {
    setCalls((prev) =>
      prev.map((c) => c.id === id ? { ...c, is_active: !c.is_active } : c)
    )
  }

  const openCreate = () => {
    setFormMode("create"); setEditingCall(null); setFormOpen(true)
  }
  const openEdit = (call: Call) => {
    setFormMode("edit"); setEditingCall(call); setFormOpen(true); setDetailOpen(false)
  }
  const openDetail = (call: Call) => {
    setDetailCall(call); setDetailOpen(true)
  }

  // Page numbers
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const start = Math.max(0, Math.min(page - 2, totalPages - 5))
    const end = Math.min(totalPages, start + 5)
    for (let i = start; i < end; i++) pages.push(i)
    return pages
  }, [page, totalPages])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">상담 관리</h1>
          <p className="text-sm text-muted-foreground">
            필터 결과 {filtered.length}건
          </p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-1" /> 신규 상담
        </Button>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-1">기간</span>
            {([
              ["today", "오늘"], ["yesterday", "어제"], ["week", "이번주"], ["month", "이번달"], ["all", "전체"],
            ] as [DatePreset, string][]).map(([key, label]) => (
              <Button
                key={key}
                variant={datePreset === key ? "default" : "outline"}
                size="sm"
                onClick={() => applyDatePreset(key)}
                className={datePreset === key ? "bg-slate-900" : ""}
              >
                {label}
              </Button>
            ))}
            <div className="flex items-center gap-1.5 ml-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setDatePreset("custom"); setPage(0) }}
                className="w-[140px] h-8 text-sm"
              />
              <span className="text-muted-foreground">~</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setDatePreset("custom"); setPage(0) }}
                className="w-[140px] h-8 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="담당자, 고객명, 패키지 검색..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                {Object.entries(statusLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={patientFilter} onValueChange={(v) => { setPatientFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="환자유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {Object.entries(patientTypeLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="결제상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {Object.entries(paymentStatusLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={repFilter} onValueChange={(v) => { setRepFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="담당자" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 담당자</SelectItem>
                {demoSalesReps.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>고객명</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>패키지</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>결제</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead className="text-right">시간</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((c) => {
                const rep = demoSalesReps.find((r) => r.id === c.sales_rep_id)
                return (
                  <TableRow
                    key={c.id}
                    className={`cursor-pointer hover:bg-muted/50 ${!c.is_active ? "opacity-50" : ""}`}
                    onClick={() => openDetail(c)}
                  >
                    <TableCell className="text-sm whitespace-nowrap">
                      {c.call_date}
                      {c.call_time && <span className="text-muted-foreground ml-1">{c.call_time}</span>}
                    </TableCell>
                    <TableCell className="font-medium">{rep?.name}</TableCell>
                    <TableCell className="text-sm">{c.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {patientTypeLabels[c.patient_type as PatientType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[120px] truncate">{c.package_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[c.status as CallStatus]}>
                        {statusLabels[c.status as CallStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={paymentStatusColors[c.payment_status as PaymentStatus]}>
                        {paymentStatusLabels[c.payment_status as PaymentStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {c.payment_amount > 0 ? formatKRW(c.payment_amount) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {Math.round(c.duration_seconds / 60)}분
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(c)}>
                            <Eye className="h-4 w-4 mr-2" /> 상세 보기
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(c)}>
                            <Pencil className="h-4 w-4 mr-2" /> 수정
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(c.id)}>
                            {c.is_active ? (
                              <><PowerOff className="h-4 w-4 mr-2" /> 비활성화</>
                            ) : (
                              <><Power className="h-4 w-4 mr-2" /> 활성화</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    조건에 맞는 상담 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {filtered.length > 0 ? `${page * pageSize + 1}-${Math.min((page + 1) * pageSize, filtered.length)}` : "0"} / {filtered.length}건
              </p>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0) }}>
                <SelectTrigger className="w-[80px] h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)}>{s}건</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers.map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className={`h-8 w-8 p-0 text-xs ${p === page ? "bg-slate-900" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
