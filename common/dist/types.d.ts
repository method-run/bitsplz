export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
