"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generateDemoConsultations, demoCounselors, channelLabels, outcomeLabels, outcomeColors } from "@/lib/demo-data"
import { formatKRW } from "@/lib/format"
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Channel, Outcome } from "@/lib/types/database"

const PAGE_SIZE = 15

export default function ConsultationsPage() {
  const [search, setSearch] = useState("")
  const [channelFilter, setChannelFilter] = useState<string>("all")
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all")
  const [page, setPage] = useState(0)

  const allConsultations = useMemo(() => generateDemoConsultations(), [])

  const filtered = useMemo(() => {
    return allConsultations.filter((c) => {
      if (channelFilter !== "all" && c.channel !== channelFilter) return false
      if (outcomeFilter !== "all" && c.outcome !== outcomeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const counselor = demoCounselors.find((co) => co.id === c.counselor_id)
        const matchName = counselor?.name.toLowerCase().includes(q)
        const matchTreatment = c.treatment_name?.toLowerCase().includes(q)
        const matchNotes = c.consultation_notes?.toLowerCase().includes(q)
        if (!matchName && !matchTreatment && !matchNotes) return false
      }
      return true
    }).sort((a, b) => b.consultation_date.localeCompare(a.consultation_date))
  }, [allConsultations, channelFilter, outcomeFilter, search])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">상담 관리</h1>
          <p className="text-sm text-muted-foreground">전체 {filtered.length}건</p>
        </div>
        <Link href="/dashboard/consultations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 상담 등록
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="상담사, 시술명, 메모 검색..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-9"
              />
            </div>
            <Select value={channelFilter} onValueChange={(v) => { setChannelFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="채널" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 채널</SelectItem>
                {Object.entries(channelLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={outcomeFilter} onValueChange={(v) => { setOutcomeFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="결과" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 결과</SelectItem>
                {Object.entries(outcomeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
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
                <TableHead>상담사</TableHead>
                <TableHead>채널</TableHead>
                <TableHead>시술</TableHead>
                <TableHead>결과</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead className="text-right">시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((c) => {
                const counselor = demoCounselors.find((co) => co.id === c.counselor_id)
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm">{c.consultation_date}</TableCell>
                    <TableCell className="font-medium">{counselor?.name}</TableCell>
                    <TableCell>
                      <span className="text-sm">{channelLabels[c.channel as Channel]}</span>
                    </TableCell>
                    <TableCell className="text-sm">{c.treatment_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={outcomeColors[c.outcome as Outcome]}>
                        {outcomeLabels[c.outcome as Outcome]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {c.paid_amount > 0 ? formatKRW(c.paid_amount) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {c.duration_minutes}분
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length}건
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
