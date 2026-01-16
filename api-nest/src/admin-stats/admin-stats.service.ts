import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PolicyStatus } from '@prisma/client';

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Statistiques globales + par agence */
  async overview() {
    const [clientsTotal, policiesTotal, activePolicies, expiredPolicies, canceledPolicies] =
      await Promise.all([
        this.prisma.client.count(),
        this.prisma.policy.count(),
        this.prisma.policy.count({ where: { status: PolicyStatus.ACTIVE } }),
        this.prisma.policy.count({ where: { status: PolicyStatus.EXPIRED } }),
        this.prisma.policy.count({ where: { status: PolicyStatus.CANCELED } }),
      ]);

    // Comptages par agence (clients + contrats)
    const clientsByBranch = await this.prisma.client.groupBy({
      by: ['branchId'],
      _count: { _all: true },
    });

    const policiesByBranch = await this.prisma.policy.groupBy({
      by: ['branchId'],
      _count: { _all: true },
    });

    // Contrats qui expirent bientôt (ex : dans 30 jours)
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);

    const expiringSoon = await this.prisma.policy.findMany({
      where: {
        status: PolicyStatus.ACTIVE,
        endDate: { gte: now, lte: soon },
      },
      include: { client: true, branch: true },
      orderBy: { endDate: 'asc' },
      take: 20,
    });

    return {
      totals: {
        clients: clientsTotal,
        policies: policiesTotal,
        policiesActive: activePolicies,
        policiesExpired: expiredPolicies,
        policiesCanceled: canceledPolicies,
      },
      byBranch: {
        clients: clientsByBranch,
        policies: policiesByBranch,
      },
      expiringSoon,
    };
  }
}
