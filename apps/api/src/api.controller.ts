import { Controller, Get } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  @ApiExcludeEndpoint()
  getHello(): string {
    return this.apiService.getHello();
  }
}
