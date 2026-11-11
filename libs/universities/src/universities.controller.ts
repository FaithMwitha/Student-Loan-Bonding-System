import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { Role } from '@app/common';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto } from './dto/create-university.dto';

@ApiTags('Universities')
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateUniversityDto) {
    return this.universitiesService.create(dto);
  }

  // Public - Anyone (even without a token) can view the list
  @Get()
  findAll() {
    return this.universitiesService.findAll();
  }

  // Public - Anyone can check a specific university's fee
  @Get(':name')
  findOneByName(@Param('name') name: string) {
    return this.universitiesService.findOneByName(name);
  }
}