export const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api`;

export const LOGIN_URL = `${BASE_URL}/auth/login`;
export const REGISTER_URL = `${BASE_URL}/auth/register`;
export const VERIFY_EMAIL_URL = `${BASE_URL}/auth/verify-email`;
export const ADMIN_LOGIN_AS_USER_URL = `${BASE_URL}/auth/admin/login-as-user`;

export const TASKS_URL = `${BASE_URL}/tasks`;
export const TASK_BY_ID_URL = (id: string) => `${BASE_URL}/tasks/${id}`;
export const TASK_STATUS_URL = (id: string) => `${BASE_URL}/tasks/${id}/status`;
export const TASK_ACTIVITY_URL = (id: string) => `${BASE_URL}/tasks/${id}/activity`;

export const LEADERBOARD_URL = `${BASE_URL}/leaderboard`;
export const USER_STATS_URL = `${BASE_URL}/leaderboard/my-stats`;