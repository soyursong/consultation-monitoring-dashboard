"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Key, Database, Users } from "lucide-react"
import { demoSalesReps } from "@/lib/demo-data"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-sm text-muted-foreground">시스템 설정을 관리합니다</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 플라우드 API 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle className="text-base">플라우드 API 연동</CardTitle>
            </div>
            <CardDescription>플라우드 Developer Platform API 설정</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Client ID</Label>
              <Input placeholder="플라우드 Client ID 입력" type="password" />
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <Input placeholder="플라우드 Secret Key 입력" type="password" />
            </div>
            <div className="space-y-2">
              <Label>서비스 지역</Label>
              <div className="flex gap-2">
                <Badge variant="secondary">US (기본)</Badge>
                <Badge variant="outline">JP</Badge>
              </div>
            </div>
            <Button className="w-full">연결 테스트</Button>
          </CardContent>
        </Card>

        {/* Supabase 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle className="text-base">데이터베이스 설정</CardTitle>
            </div>
            <CardDescription>Supabase 프로젝트 연결 설정</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Supabase URL</Label>
              <Input placeholder="https://xxx.supabase.co" />
            </div>
            <div className="space-y-2">
              <Label>Anon Key</Label>
              <Input placeholder="Supabase Anon Key" type="password" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">데모 모드</Badge>
              <span className="text-xs text-muted-foreground">현재 데모 데이터로 운영 중</span>
            </div>
            <Button className="w-full" variant="outline">연결 설정</Button>
          </CardContent>
        </Card>

        {/* 센터 관리 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle className="text-base">센터 관리</CardTitle>
            </div>
            <CardDescription>센터 정보를 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="font-medium">풋케어센터 강남점</span>
              <Badge>활성</Badge>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Input placeholder="새 센터명" />
              <Button variant="outline" size="sm">추가</Button>
            </div>
          </CardContent>
        </Card>

        {/* 담당자 관리 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle className="text-base">담당자 관리</CardTitle>
            </div>
            <CardDescription>세일즈 담당자를 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoSalesReps.map((rep) => (
              <div key={rep.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{rep.name}</p>
                  <p className="text-xs text-muted-foreground">{rep.position}</p>
                </div>
                <Badge variant={rep.position === '총괄실장' ? "default" : "secondary"}>
                  {rep.position}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
