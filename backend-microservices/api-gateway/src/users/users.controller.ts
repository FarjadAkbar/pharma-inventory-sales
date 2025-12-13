import { Controller, Get, Post, Put, Delete, Body, Param, Inject, Req, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, UpdateUserDto, USER_PATTERNS } from '@repo/shared';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await firstValueFrom(
      this.userClient.send(USER_PATTERNS.CREATE, createUserDto)
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.userClient.send(USER_PATTERNS.FIND_ALL, {})
    );
  }

  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);
    try {
      // Decode JWT token to get user ID
      // JWT payload uses 'sub' for user ID (standard JWT claim)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const userId = payload.sub || payload.id;

      if (!userId) {
        throw new UnauthorizedException('Invalid token: user ID not found');
      }

      return await firstValueFrom(
        this.userClient.send(USER_PATTERNS.FIND_ONE, userId)
      );
    } catch (error) {
      // If it's already an UnauthorizedException, re-throw it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Log the error for debugging
      console.error('Error in getCurrentUser:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.userClient.send(USER_PATTERNS.FIND_ONE, +id)
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await firstValueFrom(
      this.userClient.send(USER_PATTERNS.UPDATE, { id: +id, updateUserDto })
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await firstValueFrom(
      this.userClient.send(USER_PATTERNS.DELETE, +id)
    );
  }
}
