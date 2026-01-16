import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FakeRole } from '../common/fake-auth';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Applique le scope agence selon rôle */
  private scopeWhere(role: FakeRole, branchId?: number) {
    // DG : pas de restriction
    if (role === 'DG_ADMIN') return {};
    // Pour le test: si pas de branchId, on refuse
    if (!branchId) throw new BadRequestException('Header x-branch-id requis (non DG)');
    return { branchId };
  }

  /** Création client + contrôles cohérence */
  async create(dto: CreateClientDto, actor: { role: FakeRole; branchId?: number }) {
    // Non DG : on force le branchId du header (évite création dans autre agence)
    if (actor.role !== 'DG_ADMIN') {
      if (!actor.branchId) throw new BadRequestException('Header x-branch-id requis');
      dto.branchId = actor.branchId;
    }

    // Vérifier agence existante
    const branch = await this.prisma.branch.findUnique({ where: { id: dto.branchId } });
    if (!branch) throw new BadRequestException('Agence introuvable');

    // Anti-doublon CNI (si fourni)
    if (dto.cni) {
      const existsCni = await this.prisma.client.findUnique({ where: { cni: dto.cni } });
      if (existsCni) throw new BadRequestException('CNI déjà utilisé');
    }

    // Anti-doublon simple (téléphone + nom)
    const existsPhoneName = await this.prisma.client.findFirst({
      where: {
        phone: dto.phone,
        lastName: dto.lastName,
      },
    });
    if (existsPhoneName) throw new BadRequestException('Client déjà existant (téléphone + nom)');

    return this.prisma.client.create({ data: dto });
  }

  /** Liste + recherche + pagination + scope */
  async findAll(params: {
    q?: string;
    page?: number;
    pageSize?: number;
    actor: { role: FakeRole; branchId?: number };
  }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? Math.min(params.pageSize, 50) : 10;
    const skip = (page - 1) * pageSize;

    const scoped = this.scopeWhere(params.actor.role, params.actor.branchId);

    const q = params.q?.trim();
    const where = {
      ...scoped,
      // On ne renvoie que les actifs (soft delete)
      isActive: true,
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' as const } },
              { lastName: { contains: q, mode: 'insensitive' as const } },
              { phone: { contains: q } },
              { cni: { contains: q } },
              { email: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { branch: true },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      items,
    };
  }

  /** Détail (scope) */
  async findOne(id: number, actor: { role: FakeRole; branchId?: number }) {
    const scoped = this.scopeWhere(actor.role, actor.branchId);

    const client = await this.prisma.client.findFirst({
      where: { id, ...scoped },
      include: { branch: true, policies: true },
    });

    if (!client) throw new NotFoundException('Client introuvable');
    return client;
  }

  /** Mise à jour (scope) */
  async update(id: number, dto: UpdateClientDto, actor: { role: FakeRole; branchId?: number }) {
    await this.findOne(id, actor);

    // Non DG : empêcher de changer de branch
    if (actor.role !== 'DG_ADMIN') {
      delete (dto as any).branchId;
    }

    // Si CNI modifiée, vérifier unicité
    if (dto.cni) {
      const existsCni = await this.prisma.client.findUnique({ where: { cni: dto.cni } });
      if (existsCni && existsCni.id !== id) throw new BadRequestException('CNI déjà utilisé');
    }

    return this.prisma.client.update({ where: { id }, data: dto });
  }

  /** Suppression logique (scope) */
  async remove(id: number, actor: { role: FakeRole; branchId?: number }) {
    await this.findOne(id, actor);

    // Option: refuser si contrats actifs (métier)
    const activePolicies = await this.prisma.policy.count({
      where: { clientId: id, status: 'ACTIVE' as any },
    });
    if (activePolicies > 0) {
      throw new BadRequestException('Impossible: le client a des contrats actifs');
    }

    return this.prisma.client.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
