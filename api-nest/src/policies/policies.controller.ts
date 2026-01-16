import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { PolicyStatus } from '@prisma/client';

@Controller('policies')
export class PoliciesController {
  constructor(private readonly service: PoliciesService) {}

  @Post()
  create(@Body() dto: CreatePolicyDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: PolicyStatus,
    @Query('clientId') clientId?: string,
  ) {
    return this.service.findAll({
      branchId: branchId ? Number(branchId) : undefined,
      status,
      clientId: clientId ? Number(clientId) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePolicyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
