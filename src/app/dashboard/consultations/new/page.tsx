"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { demoCounselors, channelLabels } from "@/lib/demo-data"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewConsultationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    // 데모: 실제로는 Supabase에 저장
    setTimeout(() => {
      router.push("/dashboard/consultations")
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/consultations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">새 상담 등록</h1>
          <p className="text-sm text-muted-foreground">상담 내역을 기록합니다</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>상담사</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="상담사 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoCounselors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.branch})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>고객명</Label>
                <Input placeholder="고객 이름 입력" required />
              </div>
              <div className="space-y-2">
                <Label>연락처</Label>
                <Input placeholder="010-0000-0000" />
              </div>
              <div className="space-y-2">
                <Label>유입 채널</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="채널 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(channelLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>상담일</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="space-y-2">
                  <Label>상담시간 (분)</Label>
                  <Input type="number" placeholder="30" min={1} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 시술 및 금액 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">시술 및 금액</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>시술 카테고리</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {['피부', '체형', '안면윤곽', '눈', '코', '리프팅', '보톡스/필러'].map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>시술명</Label>
                <Input placeholder="시술명 입력" />
              </div>
              <div className="space-y-2">
                <Label>상담 결과</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="결과 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONVERTED">전환 (예약/결제)</SelectItem>
                    <SelectItem value="FOLLOW_UP">재상담 필요</SelectItem>
                    <SelectItem value="PENDING">대기</SelectItem>
                    <SelectItem value="CANCELLED">취소</SelectItem>
                    <SelectItem value="REJECTED">보류</SelectItem>
                    <SelectItem value="NO_SHOW">노쇼</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>제시 금액</Label>
                  <Input type="number" placeholder="0" min={0} step={10000} />
                </div>
                <div className="space-y-2">
                  <Label>결제 금액</Label>
                  <Input type="number" placeholder="0" min={0} step={10000} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>상담 메모</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="상담 내용을 기록하세요..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link href="/dashboard/consultations">
            <Button variant="outline">취소</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  )
}
