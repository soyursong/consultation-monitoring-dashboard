"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  demoSalesReps, demoPackages, dropReasons,
  statusLabels, paymentStatusLabels, patientTypeLabels, referralSourceLabels,
} from "@/lib/demo-data"
import type { Call, CallStatus, PaymentStatus, PatientType, ReferralSource } from "@/lib/types/database"

interface CallFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  call?: Call | null
  onSubmit: (data: Partial<Call>) => void
}

const today = () => new Date().toISOString().split("T")[0]

export function CallFormDialog({ open, onOpenChange, mode, call, onSubmit }: CallFormDialogProps) {
  const [form, setForm] = useState({
    customer_name: "",
    sales_rep_id: "",
    call_date: today(),
    call_time: "",
    patient_type: "new" as PatientType,
    referral_source: "" as ReferralSource | "",
    package_name: "",
    status: "unconfirmed" as CallStatus,
    payment_status: "unpaid" as PaymentStatus,
    payment_amount: 0,
    duration_minutes: 0,
    drop_reason: "",
    is_confirmed: false,
    notes: "",
  })

  useEffect(() => {
    if (mode === "edit" && call) {
      setForm({
        customer_name: call.customer_name,
        sales_rep_id: call.sales_rep_id,
        call_date: call.call_date,
        call_time: call.call_time || "",
        patient_type: call.patient_type,
        referral_source: call.referral_source || "",
        package_name: call.package_name || "",
        status: call.status,
        payment_status: call.payment_status,
        payment_amount: call.payment_amount,
        duration_minutes: Math.round(call.duration_seconds / 60),
        drop_reason: call.drop_reason || "",
        is_confirmed: call.is_confirmed,
        notes: call.notes || "",
      })
    } else if (mode === "create") {
      setForm({
        customer_name: "",
        sales_rep_id: "",
        call_date: today(),
        call_time: "",
        patient_type: "new",
        referral_source: "",
        package_name: "",
        status: "unconfirmed",
        payment_status: "unpaid",
        payment_amount: 0,
        duration_minutes: 0,
        drop_reason: "",
        is_confirmed: false,
        notes: "",
      })
    }
  }, [mode, call, open])

  const handleSubmit = () => {
    if (!form.customer_name || !form.sales_rep_id || !form.call_date) return
    onSubmit({
      customer_name: form.customer_name,
      sales_rep_id: form.sales_rep_id,
      call_date: form.call_date,
      call_time: form.call_time || undefined,
      patient_type: form.patient_type,
      referral_source: form.referral_source || undefined,
      package_name: form.package_name || undefined,
      status: form.status,
      payment_status: form.payment_status,
      payment_amount: form.payment_amount,
      duration_seconds: form.duration_minutes * 60,
      drop_reason: form.drop_reason || null,
      is_confirmed: form.is_confirmed,
      notes: form.notes || undefined,
    })
    onOpenChange(false)
  }

  const isValid = form.customer_name && form.sales_rep_id && form.call_date

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "신규 상담 입력" : "상담 수정"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* 고객명 */}
          <div className="space-y-1.5">
            <Label>고객명 <span className="text-red-500">*</span></Label>
            <Input
              value={form.customer_name}
              onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
              placeholder="고객명 입력"
            />
          </div>

          {/* 담당자 */}
          <div className="space-y-1.5">
            <Label>담당자 <span className="text-red-500">*</span></Label>
            <Select value={form.sales_rep_id} onValueChange={(v) => setForm((f) => ({ ...f, sales_rep_id: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="담당자 선택" />
              </SelectTrigger>
              <SelectContent>
                {demoSalesReps.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name} ({r.position})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 상담일자 */}
          <div className="space-y-1.5">
            <Label>상담일자 <span className="text-red-500">*</span></Label>
            <Input
              type="date"
              value={form.call_date}
              onChange={(e) => setForm((f) => ({ ...f, call_date: e.target.value }))}
            />
          </div>

          {/* 상담시간 */}
          <div className="space-y-1.5">
            <Label>상담시간</Label>
            <Input
              type="time"
              value={form.call_time}
              onChange={(e) => setForm((f) => ({ ...f, call_time: e.target.value }))}
            />
          </div>

          {/* 환자유형 */}
          <div className="space-y-1.5">
            <Label>환자유형 <span className="text-red-500">*</span></Label>
            <Select value={form.patient_type} onValueChange={(v) => setForm((f) => ({ ...f, patient_type: v as PatientType }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(patientTypeLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 유입경로 */}
          <div className="space-y-1.5">
            <Label>유입경로</Label>
            <Select value={form.referral_source || "none"} onValueChange={(v) => setForm((f) => ({ ...f, referral_source: v === "none" ? "" : v as ReferralSource }))}>
              <SelectTrigger>
                <SelectValue placeholder="선택 안함" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">선택 안함</SelectItem>
                {Object.entries(referralSourceLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 패키지 */}
          <div className="space-y-1.5">
            <Label>패키지</Label>
            <Select value={form.package_name || "none"} onValueChange={(v) => setForm((f) => ({ ...f, package_name: v === "none" ? "" : v }))}>
              <SelectTrigger>
                <SelectValue placeholder="선택 안함" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">선택 안함</SelectItem>
                {demoPackages.filter((p) => p.is_active).map((p) => (
                  <SelectItem key={p.id} value={p.name}>{p.name} ({(p.price / 10000).toFixed(0)}만원)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 상태 */}
          <div className="space-y-1.5">
            <Label>상태 <span className="text-red-500">*</span></Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as CallStatus }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 결제상태 */}
          <div className="space-y-1.5">
            <Label>결제상태 <span className="text-red-500">*</span></Label>
            <Select value={form.payment_status} onValueChange={(v) => setForm((f) => ({ ...f, payment_status: v as PaymentStatus }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentStatusLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 결제금액 */}
          <div className="space-y-1.5">
            <Label>결제금액 (원)</Label>
            <Input
              type="number"
              min={0}
              step={10000}
              value={form.payment_amount || ""}
              onChange={(e) => setForm((f) => ({ ...f, payment_amount: Number(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>

          {/* 통화시간 */}
          <div className="space-y-1.5">
            <Label>통화시간 (분)</Label>
            <Input
              type="number"
              min={0}
              value={form.duration_minutes || ""}
              onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>

          {/* 이탈사유 */}
          <div className="space-y-1.5">
            <Label>이탈사유</Label>
            <Select value={form.drop_reason || "none"} onValueChange={(v) => setForm((f) => ({ ...f, drop_reason: v === "none" ? "" : v }))}>
              <SelectTrigger>
                <SelectValue placeholder="없음" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">없음</SelectItem>
                {dropReasons.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 확인여부 */}
          <div className="flex items-center gap-2 col-span-2">
            <input
              type="checkbox"
              id="is_confirmed"
              checked={form.is_confirmed}
              onChange={(e) => setForm((f) => ({ ...f, is_confirmed: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_confirmed">확인 완료 (컨펌)</Label>
          </div>

          {/* 메모 */}
          <div className="space-y-1.5 col-span-2">
            <Label>메모</Label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="메모 입력..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="bg-emerald-600 hover:bg-emerald-700">
            {mode === "create" ? "등록" : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
