export { }

export type Roles = 'admin' | 'athlete' | 'coach' | 'recruiter'

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles
        }
    }
}