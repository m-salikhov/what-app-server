export declare class User {
    id: string;
    username: string;
    role: 'user' | 'superuser' | 'admin';
    email: string;
    password: string;
    date: number;
}
