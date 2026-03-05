"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Settings, Key, Users, Plus, Trash2, RefreshCw, Eye, EyeOff,
  Shield, CheckCircle2, XCircle, Building2, Package, Pencil,
} from "lucide-react"
import type { Package as PackageType } from "@/lib/types/database"
import { demoSalesReps, demoUsers, demoPlaudTokens, demoCenter, demoPackages } from "@/lib/demo-data"
import { USER_ROLE_LABELS, ROLE_PERMISSIONS } from "@/lib/types/database"
import type { UserRole } from "@/lib/types/database"

const roleColors: Record<UserRole, string> = {
  master: "bg-red-100 text-red-800",
  bo: "bg-purple-100 text-purple-800",
  head_manager: "bg-blue-100 text-blue-800",
  counselor: "bg-emerald-100 text-emerald-800",
  coordinator: "bg-yellow-100 text-yellow-800",
}

export default function SettingsPage() {
  const [showTokenMap, setShowTokenMap] = useState<Record<string, boolean>>({})
  const [newTokenRepId, setNewTokenRepId] = useState<string>("")
  const [newTokenLabel, setNewTokenLabel] = useState("")
  const [newTokenValue, setNewTokenValue] = useState("")

  // Package management state
  const [packages, setPackages] = useState<PackageType[]>(() => [...demoPackages])
  const [showAddPkg, setShowAddPkg] = useState(false)
  const [newPkgName, setNewPkgName] = useState("")
  const [newPkgPrice, setNewPkgPrice] = useState("")
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null)
  const [editPkgName, setEditPkgName] = useState("")
  const [editPkgPrice, setEditPkgPrice] = useState("")

  const toggleTokenVisibility = (tokenId: string) => {
    setShowTokenMap((prev) => ({ ...prev, [tokenId]: !prev[tokenId] }))
  }

  const getRepTokens = (repId: string) => {
    return demoPlaudTokens.filter((t) => t.sales_rep_id === repId)
  }

  const formatSyncTime = (iso?: string) => {
    if (!iso) return "동기화 없음"
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 60) return `${diffMin}분 전`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}시간 전`
    return `${Math.floor(diffHr / 24)}일 전`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-sm text-muted-foreground">사용자, 플라우드 토큰, 센터를 관리합니다</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-4 w-4" />
            사용자 관리
          </TabsTrigger>
          <TabsTrigger value="plaud" className="gap-1.5">
            <Key className="h-4 w-4" />
            플라우드 토큰
          </TabsTrigger>
          <TabsTrigger value="packages" className="gap-1.5">
            <Package className="h-4 w-4" />
            패키지 관리
          </TabsTrigger>
          <TabsTrigger value="center" className="gap-1.5">
            <Building2 className="h-4 w-4" />
            센터 설정
          </TabsTrigger>
        </TabsList>

        {/* ────── 사용자 관리 탭 ────── */}
        <TabsContent value="users" className="mt-4 space-y-4">
          {/* 역할별 권한 안내 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle className="text-base">역할별 권한</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">역할</TableHead>
                      <TableHead className="text-center text-xs">전체 조회</TableHead>
                      <TableHead className="text-center text-xs">데이터 수정</TableHead>
                      <TableHead className="text-center text-xs">삭제</TableHead>
                      <TableHead className="text-center text-xs">사용자 관리</TableHead>
                      <TableHead className="text-center text-xs">권한 부여</TableHead>
                      <TableHead className="text-center text-xs">확정</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Object.keys(ROLE_PERMISSIONS) as UserRole[]).map((role) => {
                      const p = ROLE_PERMISSIONS[role]
                      const checks = [
                        p.viewAllData, p.editData, p.deleteRecords,
                        p.manageUsers, p.grantPermissions, p.confirmRecords,
                      ]
                      return (
                        <TableRow key={role}>
                          <TableCell>
                            <Badge className={roleColors[role]}>{USER_ROLE_LABELS[role]}</Badge>
                          </TableCell>
                          {checks.map((v, i) => (
                            <TableCell key={i} className="text-center">
                              {v
                                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                : <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                              }
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                * 상담실장은 본인 데이터만 조회 가능
              </p>
            </CardContent>
          </Card>

          {/* 사용자 목록 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle className="text-base">사용자 목록</CardTitle>
                  <Badge variant="outline" className="ml-1">{demoUsers.length}명</Badge>
                </div>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-3.5 w-3.5" /> 사용자 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>연결 담당자</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoUsers.map((user) => {
                    const linkedRep = user.sales_rep_id
                      ? demoSalesReps.find((r) => r.id === user.sales_rep_id)
                      : null
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge className={roleColors[user.role]}>
                            {USER_ROLE_LABELS[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {linkedRep ? linkedRep.name : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {user.is_active
                            ? <Badge variant="outline" className="text-emerald-700 border-emerald-300">활성</Badge>
                            : <Badge variant="outline" className="text-gray-500">비활성</Badge>
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-xs">
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────── 플라우드 토큰 관리 탭 ────── */}
        <TabsContent value="plaud" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <CardTitle className="text-base">플라우드 토큰 관리</CardTitle>
              </div>
              <CardDescription>
                상담실장별로 플라우드 기기 토큰을 등록하고 관리합니다. 한 담당자당 여러 개의 토큰을 등록할 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 담당자별 토큰 카드 */}
          {demoSalesReps.map((rep) => {
            const tokens = getRepTokens(rep.id)
            return (
              <Card key={rep.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white">
                        {rep.name[0]}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{rep.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{rep.position}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {tokens.filter((t) => t.is_active).length}개 활성
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tokens.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      등록된 토큰이 없습니다
                    </p>
                  ) : (
                    tokens.map((token) => (
                      <div
                        key={token.id}
                        className={`rounded-lg border p-3 ${!token.is_active ? "opacity-50 bg-gray-50" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{token.label}</span>
                            {token.is_active
                              ? <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300">활성</Badge>
                              : <Badge variant="outline" className="text-[10px] text-gray-500">비활성</Badge>
                            }
                          </div>
                          <div className="flex items-center gap-1">
                            {token.is_active && (
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-gray-100 rounded px-2 py-1 font-mono">
                            {showTokenMap[token.id] ? token.token : "••••••••••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => toggleTokenVisibility(token.id)}
                          >
                            {showTokenMap[token.id]
                              ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                              : <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            }
                          </Button>
                        </div>
                        {token.last_synced && (
                          <p className="text-[11px] text-muted-foreground mt-2">
                            마지막 동기화: {formatSyncTime(token.last_synced)}
                          </p>
                        )}
                      </div>
                    ))
                  )}

                  {/* 토큰 추가 버튼 / 폼 */}
                  {newTokenRepId === rep.id ? (
                    <div className="rounded-lg border-2 border-dashed border-emerald-200 p-3 space-y-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">라벨</Label>
                        <Input
                          placeholder="예: 플라우드 기기 1"
                          className="h-8 text-sm"
                          value={newTokenLabel}
                          onChange={(e) => setNewTokenLabel(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">토큰</Label>
                        <Input
                          placeholder="plaud_tk_..."
                          className="h-8 text-sm font-mono"
                          value={newTokenValue}
                          onChange={(e) => setNewTokenValue(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs"
                          disabled={!newTokenLabel.trim() || !newTokenValue.trim()}
                        >
                          등록
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            setNewTokenRepId("")
                            setNewTokenLabel("")
                            setNewTokenValue("")
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs"
                      onClick={() => {
                        setNewTokenRepId(rep.id)
                        setNewTokenLabel("")
                        setNewTokenValue("")
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" /> 토큰 추가
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* ────── 패키지 관리 탭 ────── */}
        <TabsContent value="packages" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <CardTitle className="text-base">패키지 / 주력 판매상품</CardTitle>
                  <Badge variant="outline" className="ml-1">
                    {packages.filter((p) => p.is_active).length}개 활성
                  </Badge>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => { setShowAddPkg(true); setNewPkgName(""); setNewPkgPrice("") }}
                >
                  <Plus className="h-3.5 w-3.5" /> 패키지 추가
                </Button>
              </div>
              <CardDescription>
                상담 시 안내하는 패키지 및 주력 판매상품을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {showAddPkg && (
                <div className="border-b bg-emerald-50/50 px-4 py-3">
                  <div className="flex items-end gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">패키지명</Label>
                      <Input
                        placeholder="패키지명 입력"
                        className="h-8 text-sm"
                        value={newPkgName}
                        onChange={(e) => setNewPkgName(e.target.value)}
                      />
                    </div>
                    <div className="w-[140px] space-y-1">
                      <Label className="text-xs">가격 (원)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-8 text-sm"
                        min={0}
                        step={10000}
                        value={newPkgPrice}
                        onChange={(e) => setNewPkgPrice(e.target.value)}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-8 bg-emerald-600 hover:bg-emerald-700"
                      disabled={!newPkgName.trim() || !newPkgPrice}
                      onClick={() => {
                        setPackages((prev) => [...prev, {
                          id: `pkg-new-${Date.now()}`,
                          center_id: "center-1",
                          name: newPkgName.trim(),
                          price: Number(newPkgPrice),
                          is_active: true,
                        }])
                        setShowAddPkg(false)
                        setNewPkgName("")
                        setNewPkgPrice("")
                      }}
                    >
                      등록
                    </Button>
                    <Button size="sm" variant="outline" className="h-8" onClick={() => setShowAddPkg(false)}>
                      취소
                    </Button>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>패키지명</TableHead>
                    <TableHead className="text-right">가격</TableHead>
                    <TableHead className="text-center">상태</TableHead>
                    <TableHead className="text-right w-[100px]">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id} className={!pkg.is_active ? "opacity-50" : ""}>
                      <TableCell>
                        {editingPkgId === pkg.id ? (
                          <Input
                            className="h-7 text-sm w-[200px]"
                            value={editPkgName}
                            onChange={(e) => setEditPkgName(e.target.value)}
                          />
                        ) : (
                          <span className="font-medium">{pkg.name}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingPkgId === pkg.id ? (
                          <Input
                            type="number"
                            className="h-7 text-sm w-[120px] ml-auto"
                            value={editPkgPrice}
                            onChange={(e) => setEditPkgPrice(e.target.value)}
                          />
                        ) : (
                          <span className="text-sm">{(pkg.price / 10000).toFixed(0)}만원</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setPackages((prev) =>
                              prev.map((p) => p.id === pkg.id ? { ...p, is_active: !p.is_active } : p)
                            )
                          }}
                        >
                          {pkg.is_active ? (
                            <Badge variant="outline" className="text-emerald-700 border-emerald-300 cursor-pointer">활성</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 cursor-pointer">비활성</Badge>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingPkgId === pkg.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => {
                                setPackages((prev) =>
                                  prev.map((p) => p.id === pkg.id ? {
                                    ...p,
                                    name: editPkgName.trim() || p.name,
                                    price: Number(editPkgPrice) || p.price,
                                  } : p)
                                )
                                setEditingPkgId(null)
                              }}
                            >
                              저장
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingPkgId(null)}>
                              취소
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setEditingPkgId(pkg.id)
                              setEditPkgName(pkg.name)
                              setEditPkgPrice(String(pkg.price))
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────── 센터 설정 탭 ────── */}
        <TabsContent value="center" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <CardTitle className="text-base">센터 정보</CardTitle>
              </div>
              <CardDescription>센터 기본 정보를 관리합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>센터명</Label>
                <Input defaultValue={demoCenter.name} />
              </div>
              <div className="space-y-2">
                <Label>업종</Label>
                <Input defaultValue={demoCenter.industry} />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">데모 모드</Badge>
                <span className="text-xs text-muted-foreground">현재 데모 데이터로 운영 중</span>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">저장</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle className="text-base">데이터베이스 연결</CardTitle>
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
              <Button className="w-full" variant="outline">연결 설정</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
