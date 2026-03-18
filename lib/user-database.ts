/**
 * User Database System - LocalStorage based
 * Stores up to 1000 users locally with bcrypt-like hashing (simple version)
 */

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

const DB_KEY = 'mdh_users_db';
const MAX_USERS = 1000;

/**
 * Simple password hashing (not crypto-grade, but enough for demo)
 * In production: use @node-rs/argon2 or bcryptjs
 */
function hashPassword(password: string): string {
  // For now, use a simple hash method via node crypto or btoa for client
  if (typeof window !== 'undefined') {
    // Client-side: use base64
    return Buffer.from(password).toString('base64');
  }
  // Server-side: would use proper crypto, but for demo we'll keep simple
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function generateId(): string {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substring(7);
}

/**
 * Get database from storage (client-side)
 */
function getDatabase(): User[] {
  if (typeof window !== 'undefined') {
    // Client only
    const stored = localStorage.getItem(DB_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  // Server-side: return empty for now
  return [];
}

/**
 * Save database to storage
 */
function saveDatabase(users: User[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DB_KEY, JSON.stringify(users));
  }
}

/**
 * Create new user
 */
export function createUser(data: RegisterData): User | null {
  // Validation
  if (!data.email || !data.password || !data.name || !data.phone) {
    return null;
  }

  if (data.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const db = getDatabase();

  // Check if user already exists
  if (db.some((u) => u.email === data.email)) {
    throw new Error('User already exists');
  }

  // Check limit
  if (db.length >= MAX_USERS) {
    throw new Error('Database full');
  }

  const user: User = {
    id: generateId(),
    email: data.email,
    passwordHash: hashPassword(data.password),
    name: data.name,
    phone: data.phone,
    createdAt: new Date(),
  };

  db.push(user);
  saveDatabase(db);

  return user;
}

/**
 * Get user by email
 */
export function getUser(email: string): User | null {
  const db = getDatabase();
  return db.find((u) => u.email === email) || null;
}

/**
 * Verify user password
 */
export function verifyUser(email: string, password: string): User | null {
  const user = getUser(email);
  if (!user) {
    return null;
  }

  if (verifyPassword(password, user.passwordHash)) {
    return user;
  }

  return null;
}

/**
 * Get all users (admin only)
 */
export function getAllUsers(): User[] {
  return getDatabase();
}

/**
 * Export users as CSV
 */
export function exportUsersCSV(): string {
  const users = getAllUsers();
  const headers = ['ID', 'Email', 'Name', 'Phone', 'Created At'];
  const rows = users.map((u) => [
    u.id,
    u.email,
    u.name,
    u.phone,
    new Date(u.createdAt).toISOString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
}

/**
 * Delete user (admin only)
 */
export function deleteUser(email: string): boolean {
  const db = getDatabase();
  const index = db.findIndex((u) => u.email === email);

  if (index === -1) {
    return false;
  }

  db.splice(index, 1);
  saveDatabase(db);
  return true;
}

/**
 * Reset database (dangerous!)
 */
export function resetDatabase(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DB_KEY);
  }
}

/**
 * Get user count
 */
export function getUserCount(): number {
  return getDatabase().length;
}

/**
 * Initialize with mock data (for testing)
 */
export function initializeMockUsers(): void {
  if (getDatabase().length > 0) {
    return;
  }

  const mockUsers: User[] = [
    {
      id: 'user_1',
      email: 'teste@exemplo.com',
      passwordHash: hashPassword('123456'),
      name: 'Usuário Teste',
      phone: '21987654321',
      createdAt: new Date(),
    },
    {
      id: 'user_2',
      email: 'admin@mdh3d.com',
      passwordHash: hashPassword('admin123'),
      name: 'Admin MDH',
      phone: '5521920137249',
      createdAt: new Date(),
    },
  ];

  saveDatabase(mockUsers);
}
