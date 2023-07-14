import type { CookieSerializeOptions } from 'cookie-es'
import type { H3Event } from 'h3'
import { setCookie } from 'h3'
import type { SignOptions } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'

const jwtSecretKey = process.env.JWT_SECRET_KEY || 'jwtsecretkey'

export type User = {
  id: number
  role: string
}

// Type safe authentication state validation
export interface AuthState {
  user: null | {
    id: number
    role: string
  }
}

export const validateAuthState = (authState: AuthState): AuthState => {
  if (authState?.user) {
    const { id, role } = authState.user
    return { user: { id, role } }
  } else {
    return { user: null }
  }
}

// Decode and validate authentication state payload from (string) token
export const decodeJwt = (token: string): AuthState => {
  try {
    const authState = jwt.verify(token, jwtSecretKey) as AuthState
    return validateAuthState(authState)
  } catch (error) {
    return { user: null }
  }
}

// Encode authentication state as JWT cookie in server response
export const jwtCookieName = process.env.JWT_COOKIE_NAME || 'jwt'
const jwtSignOptions: SignOptions = { expiresIn: '2h' }
const jwtCookieOptions: CookieSerializeOptions = { path: '/', httpOnly: true }

export const setAuthState = (user: User | null, res: H3Event): AuthState => {
  const authState = validateAuthState({ user })
  setCookie(
    res,
    jwtCookieName,
    jwt.sign(authState, jwtSecretKey, jwtSignOptions),
    jwtCookieOptions,
  )
  return authState
}
