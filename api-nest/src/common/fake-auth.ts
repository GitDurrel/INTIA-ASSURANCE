export type FakeRole = 'DG_ADMIN' | 'AGENCY_MANAGER' | 'AGENT';

export function parseBranchIdHeader(value?: string): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseRoleHeader(value?: string): FakeRole {
  const v = (value || 'AGENT').toUpperCase();
  if (v === 'DG_ADMIN' || v === 'AGENCY_MANAGER' || v === 'AGENT') return v as FakeRole;
  return 'AGENT';
}
