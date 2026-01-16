import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { PolicyStatus } from '@prisma/client';

@Injectable()
export class PoliciesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Crée un contrat (vérifie client + agence + dates cohérentes) */
  async create(dto: CreatePolicyDto) {
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new BadRequestException('Client introuvable');

    const branch = await this.prisma.branch.findUnique({ where: { id: dto.branchId } });
    if (!branch) throw new BadRequestException('Agence introuvable');

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Dates invalides');
    }
    if (end <= start) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }

    return this.prisma.policy.create({
      data: {
        policyNo: dto.policyNo,
        type: dto.type,
        status: dto.status,
        startDate: start,
        endDate: end,
        premium: dto.premium,
        clientId: dto.clientId,
        branchId: dto.branchId,
      },
    });
  }

  /** Liste des contrats (filtres : agence, statut, client) */
  async findAll(params: { branchId?: number; status?: PolicyStatus; clientId?: number }) {
    return this.prisma.policy.findMany({
      where: {
        ...(params.branchId ? { branchId: params.branchId } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.clientId ? { clientId: params.clientId } : {}),
      },
      include: { client: true, branch: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Détail d’un contrat */
  async findOne(id: number) {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
      include: { client: true, branch: true },
    });
    if (!policy) throw new NotFoundException('Contrat introuvable');
    return policy;
  }

  /** Mise à jour d’un contrat */
  async update(id: number, dto: UpdatePolicyDto) {
    await this.findOne(id);

    // Petites validations rapides si dates fournies
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    if (data.startDate && Number.isNaN(data.startDate.getTime())) {
      throw new BadRequestException('startDate invalide');
    }
    if (data.endDate && Number.isNaN(data.endDate.getTime())) {
      throw new BadRequestException('endDate invalide');
    }
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      throw new BadRequestException('endDate doit être après startDate');
    }

    return this.prisma.policy.update({ where: { id }, data });
  }

  /** Suppression logique : on résilie plutôt que supprimer la ligne */
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.policy.update({
      where: { id },
      data: { status: PolicyStatus.CANCELED },
    });
  }
}
