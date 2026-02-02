export { }

export type Roles = 'admin' | 'athlete' | 'coach' | 'recruiter'

// Better-auth extends the user type with role field
declare module "better-auth/types" {
    interface User {
        role?: Roles
    }
}