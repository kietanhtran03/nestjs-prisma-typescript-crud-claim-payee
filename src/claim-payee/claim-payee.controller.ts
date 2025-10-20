import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClaimPayeeService } from './claim-payee.service';
import { CreateClaimPayeeDto } from './dto/create-claim-payee.dto';
import { UpdateClaimPayeeDto } from './dto/update-claim-payee.dto';

@Controller('claim-payee')
export class ClaimPayeeController {
  constructor(private readonly claimPayeeService: ClaimPayeeService) {}

  @Post()
  create(@Body() createClaimPayeeDto: CreateClaimPayeeDto) {
    return this.claimPayeeService.create(createClaimPayeeDto);
  }

  @Get()
  findAll() {
    return this.claimPayeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.claimPayeeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClaimPayeeDto: UpdateClaimPayeeDto) {
    return this.claimPayeeService.update(+id, updateClaimPayeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.claimPayeeService.remove(+id);
  }
}
