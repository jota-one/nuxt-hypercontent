import type { H3Event } from 'h3'

import { getAcl } from '~/utils/acl'
import { decodeJwt } from '~/utils/jwt'

export const getUser = (event: H3Event) => {
  const { utjwt } = parseCookies(event)
  return decodeJwt(utjwt).user
}

const getUserRole = (event: H3Event) => {
  return getUser(event)?.role
}

const hasUserRoles = (
  event: H3Event,
  lowestRole: string,
  skipErrors?: boolean,
) => {
  if (!skipErrors && !isAuthenticatedRequest(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'You must be authenticated to access this resource',
    })
  }

  const { acl } = useRuntimeConfig().public

  if (!acl.includes(lowestRole)) {
    throw createError({
      fatal: false,
      stack: '',
      message: 'Expected user role does not exist',
      data: { code: 'tbd' },
    })
  }

  const userRole = getUserRole(event) || ''
  const roles = getAcl(userRole)

  const hasRole = userRole && roles.includes(lowestRole)

  if (!skipErrors && !hasRole) {
    throw createError({
      statusCode: 401,
      statusMessage: 'You miss the required privileges to access this resource',
    })
  }

  return hasRole
}

export const isAuthenticatedRequest = (event: H3Event) => {
  const userRole = getUserRole(event)
  return Boolean(userRole)
}

export const isAdmin = (event: H3Event, skipErrors?: boolean) => {
  const { roles } = useRuntimeConfig().public
  return hasUserRoles(event, roles.admin, skipErrors)
}

export const isAuthor = (event: H3Event, skipErrors?: boolean) => {
  const { roles } = useRuntimeConfig().public
  return hasUserRoles(event, roles.author, skipErrors)
}

export const isStaff = (event: H3Event, skipErrors?: boolean) => {
  const { roles } = useRuntimeConfig().public
  return hasUserRoles(event, roles.staff, skipErrors)
}
