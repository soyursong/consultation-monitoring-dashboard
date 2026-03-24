"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Stethoscope } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL fragment에서 토큰 처리 (Google OAuth 콜백)
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes("access_token")) {
      setIsLoading(true)
      const supabase = createClient()

      // Supabase가 hash에서 세션을 자동으로 복원
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.push("/dashboard")
        } else {
          // hash 파라미터를 수동으로 파싱하여 세션 설정
          const params = new URLSearchParams(hash.substring(1))
          const accessToken = params.get("access_token")
          const refreshToken = params.get("refresh_token")

          if (accessToken && refreshToken) {
            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            }).then(({ error }) => {
              if (error) {
                setError(error.message)
                setIsLoading(false)
              } else {
                router.push("/dashboard")
              }
            })
          }
        }
      })
    }
  }, [router])

  function handleGoogleLogin() {
    setIsLoading(true)
    setError(null)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const redirectTo = encodeURIComponent(window.location.origin + "/login")
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`

    window.location.href = authUrl
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">상담 모니터링 시스템</CardTitle>
          <CardDescription>Google 계정으로 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">로그인 처리 중...</p>
          ) : (
            <Button
              className="w-full flex items-center justify-center gap-3"
              onClick={handleGoogleLogin}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google 계정으로 로그인
            </Button>
          )}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          <p className="text-xs text-center text-muted-foreground">
            메디빌더 Google Workspace 계정으로 로그인해주세요
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
