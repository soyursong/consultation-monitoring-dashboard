"use client"

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  demoSalesReps, statusLabels, statusColors,
  paymentStatusLabels, paymentStatusColors, patientTypeLabels, referralSourceLabels,
} from "@/lib/demo-data"
import { formatKRW } from "@/lib/format"
import { Pencil, Power, PowerOff, CheckCircle, XCircle } from "lucide-react"
import type { Call, CallStatus, PaymentStatus, PatientType, ReferralSource } from "@/lib/types/database"

interface CallDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  call: Call | null
  onEdit: (call: Call) => void
  onToggleActive: (id: string) => void
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2">
      <span className="text-sm text-muted-foreground shrink-0 w-24">{label}</span>
      <span className="text-sm text-right">{children}</span>
    </div>
  )
}

export function CallDetailSheet({ open, onOpenChange, call, onEdit, onToggleActive }: CallDetailSheetProps) {
  if (!call) return null

  const rep = demoSalesReps.find((r) => r.id === call.sales_rep_id)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-lg">{call.customer_name}</span>
            {!call.is_active && (
              <Badge variant="secondary" className="bg-gray-200 text-gray-600 text-[10px]">비활성</Badge>
            )}
          </SheetTitle>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="secondary" className={statusColors[call.status as CallStatus]}>
              {statusLabels[call.status as CallStatus]}
            </Badge>
            <Badge variant="secondary" className={paymentStatusColors[call.payment_status as PaymentStatus]}>
              {paymentStatusLabels[call.payment_status as PaymentStatus]}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {patientTypeLabels[call.patient_type as PatientType]}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-1">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">상담 정보</h4>
          <DetailRow label="상담일시">
            {call.call_date} {call.call_time && <span className="text-muted-foreground">{call.call_time}</span>}
          </DetailRow>
          <DetailRow label="담당자">{rep?.name || "-"} <span className="text-muted-foreground text-xs">({rep?.position})</span></DetailRow>
          <DetailRow label="유입경로">
            {call.referral_source ? referralSourceLabels[call.referral_source as ReferralSource] : "-"}
          </DetailRow>
          <DetailRow label="패키지">{call.package_name || "-"}</DetailRow>
          <DetailRow label="통화시간">{Math.round(call.duration_seconds / 60)}분</DetailRow>
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">결제 정보</h4>
          <DetailRow label="결제상태">
            <Badge variant="secondary" className={paymentStatusColors[call.payment_status as PaymentStatus]}>
              {paymentStatusLabels[call.payment_status as PaymentStatus]}
            </Badge>
          </DetailRow>
          <DetailRow label="결제금액">{call.payment_amount > 0 ? formatKRW(call.payment_amount) : "-"}</DetailRow>
          {call.drop_reason && (
            <DetailRow label="이탈사유">
              <span className="text-red-600">{call.drop_reason}</span>
            </DetailRow>
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">확인 상태</h4>
          <DetailRow label="확인(컨펌)">
            <div className="flex items-center gap-1">
              {call.is_confirmed ? (
                <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-green-700">확인 완료</span></>
              ) : (
                <><XCircle className="h-4 w-4 text-yellow-600" /><span className="text-yellow-700">미확인</span></>
              )}
            </div>
          </DetailRow>
          {call.notes && (
            <div className="pt-2">
              <span className="text-sm text-muted-foreground">메모</span>
              <p className="text-sm mt-1 p-2 bg-gray-50 rounded-md">{call.notes}</p>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(call)} className="flex-1">
            <Pencil className="h-4 w-4 mr-1" /> 수정
          </Button>
          <Button
            variant={call.is_active ? "outline" : "default"}
            size="sm"
            onClick={() => { onToggleActive(call.id); onOpenChange(false) }}
            className={`flex-1 ${call.is_active ? "text-red-600 hover:bg-red-50" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {call.is_active ? (
              <><PowerOff className="h-4 w-4 mr-1" /> 비활성화</>
            ) : (
              <><Power className="h-4 w-4 mr-1" /> 활성화</>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
