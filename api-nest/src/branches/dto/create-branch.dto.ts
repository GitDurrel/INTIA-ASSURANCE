import { IsString, MinLength } from 'class-validator';

export class CreateBranchDto {
  /** Code unique (ex: DOUALA, YAOUNDE, DG) */
  @IsString()
  @MinLength(2)
  code: string;

  /** Nom affiché */
  @IsString()
  @MinLength(3)
  name: string;
}
