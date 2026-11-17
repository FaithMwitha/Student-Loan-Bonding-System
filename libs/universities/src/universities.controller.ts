import { Body, Controller, Get, Param, Post, UseGuards, Patch } from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody 
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { Role } from '@app/common';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';

@ApiTags('Universities')
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Create a new university', 
    description: 'Allows an admin to add a new university to the system with its tuition fee.' 
  })
  @ApiBody({ type: CreateUniversityDto })
  @ApiResponse({ status: 201, description: 'University successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only Admins can perform this action.' })
  @ApiResponse({ status: 409, description: 'Conflict: University name already exists.' })
  create(@Body() dto: CreateUniversityDto) {
    return this.universitiesService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Update university details', 
    description: 'Allows an admin to update the name or tuition fee of an existing university.' 
  })
  @ApiBody({ type: UpdateUniversityDto })
  @ApiResponse({ status: 200, description: 'University successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only Admins can perform this action.' })
  @ApiResponse({ status: 404, description: 'Not Found: University with the given ID does not exist.' })
  update(@Param('id') id: string, @Body() dto: UpdateUniversityDto) {
    return this.universitiesService.update(id, dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all universities', 
    description: 'Retrieves a list of all registered universities and their tuition fees. (Public)' 
  })
  @ApiResponse({ status: 200, description: 'Successfully returned list of universities.' })
  findAll() {
    return this.universitiesService.findAll();
  }

  @Get(':name')
  @ApiOperation({ 
    summary: 'Get university by name', 
    description: 'Retrieves a specific university and its fee by its exact name. (Public)' 
  })
  @ApiResponse({ status: 200, description: 'Successfully returned university details.' })
  @ApiResponse({ status: 404, description: 'Not Found: University not found.' })
  findOneByName(@Param('name') name: string) {
    return this.universitiesService.findOneByName(name);
  }
}