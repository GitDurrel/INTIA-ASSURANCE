import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Headers,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { parseBranchIdHeader, parseRoleHeader } from '../common/fake-auth';

@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post()
  create(
    @Body() dto: CreateClientDto,
    @Headers('x-branch-id') xBranchId?: string,
    @Headers('x-role') xRole?: string,
  ) {
    const actor = { branchId: parseBranchIdHeader(xBranchId), role: parseRoleHeader(xRole) };
    return this.service.create(dto, actor);
  }

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Headers('x-branch-id') xBranchId?: string,
    @Headers('x-role') xRole?: string,
  ) {
    const actor = { branchId: parseBranchIdHeader(xBranchId), role: parseRoleHeader(xRole) };
    return this.service.findAll({
      q,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      actor,
    });
  }                                                                                                                                                                                                                                                                                                                                                                                                                                 8 

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-branch-id') xBranchId?: string,
    @Headers('x-role') xRole?: string,
  ) {
    const actor = { branchId: parseBranchIdHeader(xBranchId), role: parseRoleHeader(xRole) };
    return this.service.findOne(id, actor);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientDto,
    @Headers('x-branch-id') xBranchId?: string,
    @Headers('x-role') xRole?: string,
  ) {
    const actor = { branchId: parseBranchIdHeader(xBranchId), role: parseRoleHeader(xRole) };
    return this.service.update(id, dto, actor);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-branch-id') xBranchId?: string,
    @Headers('x-role') xRole?: string,
  ) {
    const actor = { branchId: parseBranchIdHeader(xBranchId), role: parseRoleHeader(xRole) };
    return this.service.remove(id, actor);
  }
}
