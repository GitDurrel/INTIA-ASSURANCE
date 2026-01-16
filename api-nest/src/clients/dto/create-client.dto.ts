import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  /** Prénom */
  @IsString()
  @MinLength(2)
  firstName: string;

  /** Nom */
  @IsString()
  @MinLength(2)
  lastName: string;

  /** Téléphone */
  @IsString()
  phone: string;

  /** Email (optionnel) */
  @IsOptional()
  @IsEmail()
  email?: string;

  /** CNI (optionnel, unique si fourni) */
  @IsOptional()
  @IsString()
  cni?: string;

  /** Adresse (optionnel) */
  @IsOptional()
  @IsString()
  address?: string;

  /** Agence */
  @IsInt()
  branchId: number;
}
