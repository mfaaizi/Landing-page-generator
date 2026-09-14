"use client";

import type { BusinessBrief } from "@/lib/schemas/brief";
import type { Section } from "@/lib/schemas/section";

/**
 * Projects live in the browser for now. There is no account, no server-side
 * store, and nothing to deploy for a generated page, so sessionStorage covers
 * the actual need: survive a refresh, and let the intake screen hand off to
 * the workspace by id. Swap this for a database later without touching callers.
 */
export type StoredProject = {
  id: string;
  description: string;
  brief: BusinessBrief;
  sections: Section[];
  createdAt: string;
};

const KEY = (id: string) => `lpg:project:${id}`;

export function newProjectId(): string {
  return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function saveProject(project: StoredProject): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY(project.id), JSON.stringify(project));
}

export function loadProject(id: string): StoredProject | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredProject;
  } catch {
    return null;
  }
}
