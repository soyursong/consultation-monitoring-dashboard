"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { demoRecordings } from "@/lib/demo-data"
import { Mic, Play, FileText, Clock, ExternalLink } from "lucide-react"

export default function RecordingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">녹취 관리</h1>
          <p className="text-sm text-muted-foreground">플라우드 녹취 내역을 관리하고 상담 기록과 연결합니다</p>
        </div>
        <Button variant="outline">
          <ExternalLink className="mr-2 h-4 w-4" />
          플라우드 연동
        </Button>
      </div>

      {/* 플라우드 연동 안내 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Mic className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">플라우드 API 연동</p>
              <p className="text-sm text-blue-700 mt-1">
                플라우드 Developer Platform에서 API 키를 발급받아 설정에 입력하면,
                녹취 데이터가 자동으로 연동됩니다. 현재는 데모 데이터가 표시됩니다.
              </p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Private Beta</Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">STT 지원</Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">화자 분리</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 녹취 목록 */}
      <div className="space-y-4">
        {demoRecordings.map((recording) => (
          <Card key={recording.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <Mic className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      녹취 #{recording.id}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {recording.created_at} · Plaud ID: {recording.plaud_transcription_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {recording.duration_seconds ? `${Math.floor(recording.duration_seconds / 60)}분 ${recording.duration_seconds % 60}초` : "-"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Play className="mr-1 h-3 w-3" />
                    재생
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 요약 */}
              {recording.summary && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">AI 요약</span>
                  </div>
                  <p className="rounded-lg bg-gray-50 p-3 text-sm">{recording.summary}</p>
                </div>
              )}

              <Separator />

              {/* 전사 텍스트 */}
              {recording.transcript_text && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">전사 텍스트</span>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    {recording.transcript_text.split('\n').map((line, i) => (
                      <p key={i} className="text-sm py-1">
                        {line.startsWith('상담사:') ? (
                          <>
                            <span className="font-medium text-blue-600">상담사:</span>
                            {line.replace('상담사:', '')}
                          </>
                        ) : line.startsWith('고객:') ? (
                          <>
                            <span className="font-medium text-green-600">고객:</span>
                            {line.replace('고객:', '')}
                          </>
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
