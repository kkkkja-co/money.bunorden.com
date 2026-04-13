import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Code exchange succeeded — redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Code exchange failed — redirect to login with an error hint
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback_failed`
    )
  }

  // No code present — this may be a hash-based (implicit) flow.
  // The client-side Supabase instance picks up the session from the URL hash.
  // Send the user to a lightweight relay page that reads the hash and redirects.
  return NextResponse.redirect(`${origin}/auth/confirm`)
}
