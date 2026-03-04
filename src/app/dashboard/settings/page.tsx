"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Key, Database, Users } from "lucide-react"

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
                <Badge variant="outline">EU (준비중)</Badge>
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

        {/* 지점 관리 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle className="text-base">지점 관리</CardTitle>
            </div>
            <CardDescription>병원 지점 정보를 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {["강남점", "서초점"].map((branch) => (
              <div key={branch} className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">{branch}</span>
                <Badge>활성</Badge>
              </div>
            ))}
            <Separator />
            <div className="flex gap-2">
              <Input placeholder="새 지점명" />
              <Button variant="outline" size="sm">추가</Button>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 관리 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle className="text-base">사용자 관리</CardTitle>
            </div>
            <CardDescription>시스템 사용자 및 권한을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "관리자", email: "admin@clinic.com", role: "관리자" },
              { name: "김서연", email: "kim@clinic.com", role: "실장" },
              { name: "이지원", email: "lee@clinic.com", role: "상담사" },
            ].map((user) => (
              <div key={user.email} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant={user.role === "관리자" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
