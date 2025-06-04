
export class apiResponse {
    private status: number | null
    private message: string | null
    private data: any | null
    private error: any | null
    constructor(status: number, message: string, data: any, error: any) {
        this.status = status
        this.message = message
        this.data = data
        this.error = error
    }
}

export const userStatus = {
    user: "user",
    admin: "admin",
    upload: "upload"
}

export const ROLES = {
    SUPER_ADMIN: "superAdmin",
    ADMIN: "admin",
    SALESMAN: "salesman"
}

export const STORE_PLATFORM_CHARGE_TYPE = {
    PERCENTAGE: "percentage",
    FIXED: "fixed"
}

export const PRICING_TYPE = {
    WEIGHT: "weight",
    FIXED: "fixed"
}