import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Liste des agences */
  findAll() {
    return this.prisma.branch.findMany({ orderBy: { id: 'asc' } });
  }

  /** Crée une agence (code unique) */
  async create(dto: CreateBranchDto) {
    const exists = await this.prisma.branch.findUnique({ where: { code: dto.code } });
    if (exists) throw new BadRequestException('Ce code agence existe déjà');
    return this.prisma.branch.create({ data: dto });
  }
}
