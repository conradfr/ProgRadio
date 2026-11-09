// types of icons-subset.mjs, imported by vite.config.ts
export function sourcesAvailable(): boolean;
export function findUsedIcons(): string[];
export function generate(options?: { log?: (message: string) => void }): Promise<{ icons: string[], changed: boolean }>;
export function check(): { ok: boolean, reason: string | null, missing: string[], unused: string[] };
