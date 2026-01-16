import { IsDateString, IsEnum, IsInt, IsPositive, IsString } from 'class-validator';
import { PolicyStatus, PolicyType } from '@prisma/client';

export class CreatePolicyDto {
  /** Numéro de police unique */
  @IsString()
  policyNo: string;

  /** Type d’assurance */
  @IsEnum(PolicyType)
  type: PolicyType;

  /** Statut du contrat */
  @IsEnum(PolicyStatus)
  status: PolicyStatus;

  /** Date de début (ISO) */
  @IsDateString()
  startDate: string;

  /** Date de fin (ISO) */
  @IsDateString()
  endDate: string;

  /** Prime (montant > 0) */
  @IsInt()
  @IsPositive()
  premium: number;

  /** Client lié */
  @IsInt()
  clientId: number;

  /** Agence (Douala / Yaoundé / DG) */
  @IsInt()
  branchId: number;
}
