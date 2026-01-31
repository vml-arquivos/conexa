// ========================================
// SISTEMA CONEXA v1.0
// Middleware de Segurança RBAC
// "Conectando Vidas"
// ========================================

import { Request, Response, NextFunction } from 'express';

// ========================================
// TIPOS E INTERFACES
// ========================================

export enum UserRole {
  MATRIZ_ADMIN = 'MATRIZ_ADMIN',
  MATRIZ_NUTRI = 'MATRIZ_NUTRI',
  MATRIZ_PSYCHO = 'MATRIZ_PSYCHO',
  UNIT_DIRECTOR = 'UNIT_DIRECTOR',
  UNIT_SECRETARY = 'UNIT_SECRETARY',
  TEACHER = 'TEACHER',
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId?: string;  // Usuários de UNIDADE/TEACHER
  classId?: string;   // TEACHER tem acesso restrito à turma
}

// Estender Request do Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// ========================================
// HIERARQUIA DE PERMISSÕES
// ========================================

const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.MATRIZ_ADMIN]: 100,   // Poder total
  [UserRole.MATRIZ_NUTRI]: 90,    // Nutrição global
  [UserRole.MATRIZ_PSYCHO]: 90,   // Prontuários sigilosos
  [UserRole.UNIT_DIRECTOR]: 50,   // Gestão local
  [UserRole.UNIT_SECRETARY]: 30,  // Operacional
  [UserRole.TEACHER]: 10,          // Acesso restrito
};

// ========================================
// FUNÇÕES DE VERIFICAÇÃO DE PERMISSÃO
// ========================================

/**
 * Verifica se o usuário tem uma das roles permitidas
 */
export function hasRole(user: AuthUser, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * Verifica se o usuário tem nível hierárquico suficiente
 */
export function hasMinLevel(user: AuthUser, minLevel: number): boolean {
  return ROLE_HIERARCHY[user.role] >= minLevel;
}

/**
 * Verifica se o usuário pertence à mesma unidade (schoolId)
 */
export function belongsToSchool(user: AuthUser, schoolId: string): boolean {
  // MATRIZ_* tem acesso a todas as unidades
  if (user.role.startsWith('MATRIZ_')) {
    return true;
  }
  
  // Outros usuários só acessam sua própria unidade
  return user.schoolId === schoolId;
}

/**
 * Verifica se o usuário tem acesso à turma
 */
export function hasAccessToClass(user: AuthUser, classId: string): boolean {
  // MATRIZ_* e UNIT_DIRECTOR têm acesso a todas as turmas
  if (user.role.startsWith('MATRIZ_') || user.role === UserRole.UNIT_DIRECTOR) {
    return true;
  }
  
  // TEACHER só acessa sua própria turma
  if (user.role === UserRole.TEACHER) {
    return user.classId === classId;
  }
  
  // UNIT_SECRETARY tem acesso a todas as turmas da unidade
  return user.role === UserRole.UNIT_SECRETARY;
}

/**
 * Verifica se o usuário pode acessar prontuários psicológicos
 */
export function canAccessPsychRecords(user: AuthUser): boolean {
  return user.role === UserRole.MATRIZ_PSYCHO || user.role === UserRole.MATRIZ_ADMIN;
}

/**
 * Verifica se o usuário pode gerenciar cardápios globais
 */
export function canManageGlobalMenus(user: AuthUser): boolean {
  return user.role === UserRole.MATRIZ_NUTRI || user.role === UserRole.MATRIZ_ADMIN;
}

// ========================================
// MIDDLEWARES DE AUTENTICAÇÃO
// ========================================

/**
 * Middleware: Requer autenticação
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Não autenticado',
      message: 'Você precisa estar logado para acessar este recurso',
    });
  }
  
  next();
}

/**
 * Middleware: Requer role específica
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    if (!hasRole(req.user, allowedRoles)) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: `Esta ação requer uma das seguintes permissões: ${allowedRoles.join(', ')}`,
        userRole: req.user.role,
      });
    }
    
    next();
  };
}

/**
 * Middleware: Requer nível mínimo na hierarquia
 */
export function requireMinLevel(minLevel: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    if (!hasMinLevel(req.user, minLevel)) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Você não tem permissão suficiente para esta ação',
        userLevel: ROLE_HIERARCHY[req.user.role],
        requiredLevel: minLevel,
      });
    }
    
    next();
  };
}

/**
 * Middleware: Requer acesso à unidade (schoolId)
 */
export function requireSchoolAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
  
  if (!schoolId) {
    return res.status(400).json({
      error: 'schoolId não fornecido',
      message: 'É necessário especificar a unidade (schoolId)',
    });
  }
  
  if (!belongsToSchool(req.user, schoolId as string)) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Você não tem acesso a esta unidade',
      userSchoolId: req.user.schoolId,
      requestedSchoolId: schoolId,
    });
  }
  
  next();
}

/**
 * Middleware: Requer acesso à turma (classId)
 */
export function requireClassAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  const classId = req.params.classId || req.body.classId || req.query.classId;
  
  if (!classId) {
    return res.status(400).json({
      error: 'classId não fornecido',
      message: 'É necessário especificar a turma (classId)',
    });
  }
  
  if (!hasAccessToClass(req.user, classId as string)) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Você não tem acesso a esta turma',
      userClassId: req.user.classId,
      requestedClassId: classId,
    });
  }
  
  next();
}

/**
 * Middleware: Requer acesso a prontuários psicológicos
 */
export function requirePsychAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  if (!canAccessPsychRecords(req.user)) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas MATRIZ_PSYCHO e MATRIZ_ADMIN podem acessar prontuários psicológicos',
      userRole: req.user.role,
    });
  }
  
  next();
}

// ========================================
// INJEÇÃO AUTOMÁTICA DE FILTROS (MULTI-TENANCY)
// ========================================

/**
 * Middleware: Injeta schoolId automaticamente nas queries
 * Para usuários de UNIDADE/TEACHER, garante que só vejam dados da sua unidade
 */
export function injectSchoolFilter(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next();
  }
  
  // MATRIZ_* pode ver todas as unidades
  if (req.user.role.startsWith('MATRIZ_')) {
    return next();
  }
  
  // Outros usuários: forçar schoolId
  if (req.user.schoolId) {
    // Injetar schoolId em queries GET
    if (req.method === 'GET') {
      req.query.schoolId = req.user.schoolId;
    }
    
    // Injetar schoolId em body POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      req.body.schoolId = req.user.schoolId;
    }
  }
  
  next();
}

/**
 * Middleware: Injeta classId automaticamente para TEACHER
 */
export function injectClassFilter(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next();
  }
  
  // Apenas TEACHER tem classId restrito
  if (req.user.role !== UserRole.TEACHER || !req.user.classId) {
    return next();
  }
  
  // Injetar classId em queries GET
  if (req.method === 'GET') {
    req.query.classId = req.user.classId;
  }
  
  // Injetar classId em body POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.body.classId = req.user.classId;
  }
  
  next();
}

// ========================================
// AUDITORIA E LOGS
// ========================================

/**
 * Middleware: Log de ações sensíveis
 */
export function auditLog(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      console.log(`[AUDIT] ${new Date().toISOString()} | User: ${req.user.email} (${req.user.role}) | Action: ${action} | IP: ${req.ip}`);
    }
    next();
  };
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default {
  // Verificações
  hasRole,
  hasMinLevel,
  belongsToSchool,
  hasAccessToClass,
  canAccessPsychRecords,
  canManageGlobalMenus,
  
  // Middlewares
  requireAuth,
  requireRole,
  requireMinLevel,
  requireSchoolAccess,
  requireClassAccess,
  requirePsychAccess,
  injectSchoolFilter,
  injectClassFilter,
  auditLog,
};
