export type CompetitionVisibility = 'public' | 'restricted';

export interface Competition {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  visibility: CompetitionVisibility;
  rival_team_name: string;
  ownerTenantId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  owner_tenant_id?: string;
}

export interface CreateCompetitionData {
  title: string;
  description: string;
  start_at: Date;
  end_at: Date;
  visibility: CompetitionVisibility;
  rival_team_name: string;
  allowedTenantIds: string[];
} 