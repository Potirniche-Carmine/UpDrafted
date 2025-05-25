export { }

export type Roles = 'admin' | 'moderator' | 'athlete' | 'coach' | 'recruiter'

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles
        }
    }
}