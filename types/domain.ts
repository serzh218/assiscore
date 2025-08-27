import { Plan, Visibility, ProjectStatus, type Prisma } from '@prisma/client';

// Re-export enums for use across layers
export { Plan, Visibility, ProjectStatus };

// Minimal DTOs for sending to the client (no passwords or sensitive fields)
export interface UserDTO {
  id: string;
  email?: string | null;
  name?: string | null;
  plan: Plan;
  tokens: number;
  githubLinked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  plan: Plan;
  tokens: number;
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
  costTokens: number;
  createdAt: Date;
}
