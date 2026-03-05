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
  generateDemoCalls, demoSalesReps, statusLabels, statusColors,
  paymentStatusLabels, paymentStatusColors, patientTypeLabels,
} from "@/lib/demo-data"
import { formatKRW } from "@/lib/format"
import { Search, ChevronLeft, ChevronRight, Star } from "lucide-react"
import type { CallStatus, PaymentStatus, PatientType } from "@/lib/types/database"

const PAGE_SIZE = 15

export default function CallsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [patientFilter, setPatientFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [repFilter, setRepFilter] = useState<string>("all")
  const [page, setPage] = useState(0)

  const allCalls = useMemo(() => generateDemoCalls(), [])

  const filtered = useMemo(() => {
    return allCalls.filter((c) => {
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
  }, [allCalls, statusFilter, patientFilter, paymentFilter, repFilter, search])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const renderScore = (score?: number) => {
    if (!score) return "-"
    return (
      <div className="flex items-center gap-1">
        <Star className={`h-3.5 w-3.5 ${score >= 7 ? "text-yellow-400 fill-yellow-400" : score >= 5 ? "text-yellow-400" : "text-gray-300"}`} />
        <span className="text-sm">{score}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">상담 기록</h1>
        <p className="text-sm text-muted-foreground">전체 {filtered.length}건</p>
      </div>

      {/* Filters */}
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
                <TableHead>점수</TableHead>
                <TableHead>결제</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead className="text-right">시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((c) => {
                const rep = demoSalesReps.find((r) => r.id === c.sales_rep_id)
                return (
                  <TableRow key={c.id}>
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
                    <TableCell>{renderScore(c.consultation_score)}</TableCell>
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
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length > 0 ? `${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, filtered.length)}` : "0"} / {filtered.length}건
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
