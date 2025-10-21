import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ClaimPayeeService } from './claim-payee.service';
import { CreateClaimPayeeDto } from './dto/create-claim-payee.dto';
import { UpdateClaimPayeeDto } from './dto/update-claim-payee.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles-guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Role } from 'generated/prisma';
import { AuditInterceptor } from 'src/common/interceptor/audit.interceptor'; 

@ApiTags('Claim Payee')
@ApiBearerAuth()
@Controller('claim-payee')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class ClaimPayeeController {
  constructor(private readonly claimPayeeService: ClaimPayeeService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new claim payee' })
  @ApiResponse({
    status: 201,
    description: 'Claim payee created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  create(
    @Body() createClaimPayeeDto: CreateClaimPayeeDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.claimPayeeService.create(createClaimPayeeDto, userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.USER, Role.VIEWER)
  @ApiOperation({ summary: 'Get all claim payees' })
  @ApiResponse({
    status: 200,
    description: 'List of claim payees retrieved successfully',
  })
  findAll() {
    return this.claimPayeeService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.USER, Role.VIEWER)
  @ApiOperation({ summary: 'Get a claim payee by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Claim payee ID' })
  @ApiResponse({
    status: 200,
    description: 'Claim payee found',
  })
  @ApiResponse({ status: 404, description: 'Claim payee not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.claimPayeeService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a claim payee' })
  @ApiParam({ name: 'id', type: 'number', description: 'Claim payee ID' })
  @ApiResponse({
    status: 200,
    description: 'Claim payee updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Claim payee not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClaimPayeeDto: UpdateClaimPayeeDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.claimPayeeService.update(id, updateClaimPayeeDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a claim payee (soft delete)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Claim payee ID' })
  @ApiResponse({
    status: 200,
    description: 'Claim payee deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Claim payee not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only ADMIN can delete' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.claimPayeeService.remove(id, userId);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted claim payee' })
  @ApiParam({ name: 'id', type: 'number', description: 'Claim payee ID' })
  @ApiResponse({
    status: 200,
    description: 'Claim payee restored successfully',
  })
  @ApiResponse({ status: 404, description: 'Claim payee not found' })
  restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.claimPayeeService.restore(id, userId);
  }
}