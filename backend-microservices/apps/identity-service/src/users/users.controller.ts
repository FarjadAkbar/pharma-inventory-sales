import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, USER_PATTERNS } from '@repo/shared';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USER_PATTERNS.CREATE)
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern(USER_PATTERNS.FIND_ALL)
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern(USER_PATTERNS.FIND_ONE)
  findOne(@Payload() id: number) {
    return this.usersService.findOne(id);
  }

  @MessagePattern(USER_PATTERNS.FIND_BY_EMAIL)
  findByEmail(@Payload() email: string) {
    return this.usersService.findByEmail(email);
  }

  @MessagePattern(USER_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateUserDto: UpdateUserDto }) {
    return this.usersService.update(data.id, data.updateUserDto);
  }

  @MessagePattern(USER_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.usersService.delete(id);
  }
}
