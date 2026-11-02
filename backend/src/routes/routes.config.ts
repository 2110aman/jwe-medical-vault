export const API_ROUTES = {
  AUTH: {
    ROOT: 'api/auth',
    LOGIN: 'login',
    REGISTER: 'register',
    ME: 'me',
    INSPECT: 'inspect',
    DEMO_USERS: 'demo-users',
  },
  PROFILE: {
    ROOT: 'api/profile',
    ALLERGIES: 'allergies',
    MEDICATIONS: 'medications',
  },
} as const;

