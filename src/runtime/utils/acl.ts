/**
 * Returns a list of roles from highest to lowest,
 * the last one being the one passed as argument.
 * @param  {string} userRole?: the user's role
 * @return {Array<string>} ex: ['coach', 'user'] for a coach, ['admin', 'user'] for an admin, ['superadmin', 'admin', 'user'] for a superadmin...
 */
export const getAcl = (userRole?: string) => {
  const { acl } = useRuntimeConfig().public

  return acl.reduce((roles: string[], role: string) => {
    if (role === userRole || roles.includes(userRole || '')) {
      roles.push(role)
    }
    return roles
  }, [])
}
