import { Plan, Visibility, ProjectStatus, NotificationType, ProjectRole, type Prisma } from '@prisma/client';

// Re-export enums for use across layers
export { Plan, Visibility, ProjectStatus, NotificationType, ProjectRole };

// Minimal DTOs for sending to the client (no passwords or sensitive fields)
export interface UserDTO {
  id: string;
  email?: string | null;
  name?: string | null;
  plan: Plan;
  tokens: number;
  githubLinked: boolean;
  githubUsername?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  plan: Plan;
  tokens: number;
  githubLinked: boolean;
  githubUsername?: string | null;
}

export interface ProjectDTO {
  id: string;
  ownerId: string;
  visibility: Visibility;
  title: string;
  type: string;
  spec: Prisma.JsonValue;
  files?: Prisma.JsonValue | null;
  previewUrl?: string | null;
  repoUrl?: string | null;
  deployUrl?: string | null;
  deployProvider?: string | null;
  domain?: string | null;
  lastDeployedAt?: Date | null;
  status: ProjectStatus;
  createdAt: Date;
}

export interface GenerationDTO {
  id: string;
  projectId: string;
  costTokens: number;
  logs: string;
  createdAt: Date;
}

export interface PatchDTO {
  id: string;
  projectId: string;
  diff: string;
  status: string;
  notes?: string;
  costTokens: number;
  createdAt: Date;
}

export interface PaymentDTO {
  id: string;
  userId: string;
  type: string;
  amount: number;
  tokens?: number;
  status: string;
  externalId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.JsonValue | null;
  readAt?: Date | null;
  createdAt: Date;
}

export interface NotificationPreferenceDTO {
  userId: string;
  emailOn: boolean;
  locale: string;
  genReady: boolean;
  genError: boolean;
  patchReady: boolean;
  patchError: boolean;
  deployReady: boolean;
  deployError: boolean;
  billing: boolean;
}
