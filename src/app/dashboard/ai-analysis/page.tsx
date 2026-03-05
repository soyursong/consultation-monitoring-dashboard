"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Send, Sparkles, MessageSquare, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"

const sampleQueries = [
  "이번 달 전환율이 가장 높은 담당자는?",
  "광고 유입 신규 고객의 주요 이탈 사유는?",
  "내성발톱 교정 패키지의 평균 객단가는?",
  "지난 주 대비 상담 건수 변화는?",
]

const sampleCoachingReports = [
  {
    rep: "이아인",
    score: 92,
    strengths: ["고객 니즈 파악 능력 우수", "패키지 업셀링 자연스러움", "재방문 유도 스킬 탁월"],
    improvements: ["초반 라포 형성 시간 단축 필요", "가격 저항 처리 패턴 다양화"],
    tip: "고가 패키지 상담 시 비교 테이블을 활용하면 전환율 10% 이상 개선 가능",
  },
  {
    rep: "김정혜",
    score: 85,
    strengths: ["친절한 응대", "시술 설명 상세", "후속 관리 안내 철저"],
    improvements: ["클로징 타이밍 개선", "결제 유도 적극성 필요"],
    tip: "상담 후 24시간 내 팔로업 메시지를 보내면 재상담 전환율이 높아집니다",
  },
  {
    rep: "박윤지",
    score: 78,
    strengths: ["빠른 응대 속도", "명확한 가격 안내"],
    improvements: ["고객 불안 해소 스킬 보완", "추가 상담 제안 부족", "종합 패키지 안내 강화"],
    tip: "시술 전후 사진을 활용한 상담이 전환율 향상에 효과적입니다",
  },
]

interface ChatMessage {
  role: "user" | "ai"
  content: string
}

export default function AiAnalysisPage() {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content: "안녕하세요! 상담 데이터에 대해 궁금한 점을 질문해주세요. 매출, 전환율, 담당자 성과 등 다양한 분석을 도와드립니다.",
    },
  ])

  const handleSend = () => {
    if (!query.trim()) return
    const userMsg = query.trim()
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setQuery("")

    // 시뮬레이션 응답
    setTimeout(() => {
      let response = ""
      if (userMsg.includes("전환율") && userMsg.includes("높은")) {
        response = "이번 달 전환율이 가장 높은 담당자는 **이아인** (총괄실장)입니다.\n\n- 전체 전환율: 55.2%\n- 광고 신규 전환율: 48.7%\n- 총 상담건수: 87건\n- 총 매출: 약 1,240만원\n\n이아인 실장은 특히 내성발톱 교정 패키지에서 높은 전환율을 보이고 있으며, 고객 니즈 파악 능력이 우수합니다."
      } else if (userMsg.includes("이탈")) {
        response = "광고 유입 신규 고객의 주요 이탈 사유 TOP 3:\n\n1. **가격 부담** (32%) - 가장 높은 비율\n2. **타 업체 비교** (21%) - 경쟁사 대비 검토\n3. **효과 의심** (15%) - 시술 효과에 대한 불안\n\n**개선 제안**: 가격 부담이 가장 큰 이탈 사유이므로, 분할 결제 옵션이나 첫 방문 할인을 적극 안내하는 것이 효과적입니다."
      } else if (userMsg.includes("객단가") || userMsg.includes("패키지")) {
        response = "내성발톱 교정 패키지 분석:\n\n- 평균 객단가: **13.2만원**\n- 전환율: **42.5%**\n- 전체 매출 비중: **28.3%**\n\n풋케어 종합 패키지 대비 객단가는 낮지만, 전환율이 높아 안정적인 매출원입니다. 교정 후 종합 패키지로의 업셀링 비율은 약 18%입니다."
      } else {
        response = `"${userMsg}"에 대한 분석을 진행했습니다.\n\n현재 데모 모드에서는 제한된 응답만 제공됩니다. 실제 서비스에서는 Plaud AI 녹취 데이터와 연동하여 더 정확한 분석 결과를 제공합니다.\n\n**추천 질문:**\n- 이번 달 전환율이 가장 높은 담당자는?\n- 광고 유입 신규 고객의 주요 이탈 사유는?\n- 내성발톱 교정 패키지의 평균 객단가는?`
      }
      setMessages((prev) => [...prev, { role: "ai", content: response }])
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI 분석</h1>
        <p className="text-sm text-muted-foreground">AI가 상담 데이터를 분석하고 인사이트를 제공합니다</p>
      </div>

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            자연어 질의
          </TabsTrigger>
          <TabsTrigger value="coaching" className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            코칭 리포트
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4">
          <Card className="flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
            {/* Chat messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user" ? "bg-slate-900 text-white" : "bg-gray-50 border"}`}>
                    {msg.role === "ai" && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Brain className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-600">AI 분석</span>
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-line">
                      {msg.content.split("**").map((part, j) =>
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Sample queries */}
            <div className="border-t px-4 py-2">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {sampleQueries.map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap text-xs"
                    onClick={() => { setQuery(q) }}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="상담 데이터에 대해 질문하세요..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="coaching" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {sampleCoachingReports.map((report) => (
              <Card key={report.rep}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-sm font-bold text-white">
                        {report.rep[0]}
                      </div>
                      <div>
                        <CardTitle className="text-base">{report.rep}</CardTitle>
                        <p className="text-xs text-muted-foreground">코칭 리포트</p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${report.score >= 90 ? "text-emerald-600" : report.score >= 80 ? "text-blue-600" : "text-yellow-600"}`}>
                      {report.score}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-emerald-600 mb-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> 강점
                    </p>
                    <ul className="space-y-1">
                      {report.strengths.map((s) => (
                        <li key={s} className="text-sm text-muted-foreground flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">+</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-600 mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> 개선점
                    </p>
                    <ul className="space-y-1">
                      {report.improvements.map((s) => (
                        <li key={s} className="text-sm text-muted-foreground flex items-start gap-1.5">
                          <span className="text-orange-500 mt-0.5">-</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" /> AI 코칭 팁
                    </p>
                    <p className="text-xs text-blue-600">{report.tip}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
