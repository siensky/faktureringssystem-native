import type { CompanyOverviewDto } from '@/types/contracts';

import type { TokenPairResponse } from './auth';
import { apiRequest } from './client';

export function getCompaniesOverview(): Promise<CompanyOverviewDto> {
  return apiRequest('/auth/companies/overview');
}

/** Kräver att man redan är inloggad — servern verifierar tenantId mot user_company_links. */
export function switchCompany(tenantId: number): Promise<TokenPairResponse> {
  return apiRequest('/auth/companies/switch', { method: 'POST', body: { tenantId } });
}
