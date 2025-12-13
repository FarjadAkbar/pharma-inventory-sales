import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@pharma/utils/decorators';
import { ApiRequest, UserRequest } from '@pharma/utils/request';
import { SearchHttpSchema } from '@pharma/utils/search';
import { SortHttpSchema } from '@pharma/utils/sort';
import {
  USERS_CREATE,
  USERS_DELETE,
  USERS_GET_BY_ID,
  USERS_GET_CURRENT,
  USERS_LIST,
  USERS_UPDATE
} from '@pharma/utils';

import { UserEntity } from '@pharma/core/user/entity/user';

@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private readonly usersClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('user:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(
      this.usersClient.send(USERS_CREATE, {
        ...body,
        user,
        tracing
      })
    );
  }

  @Put(':id')
  @Version('1')
  @Permission('user:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest) {
    return firstValueFrom(
      this.usersClient.send(USERS_UPDATE, {
        ...body,
        id: params.id,
        user,
        tracing
      })
    );
  }

  @Get()
  @Version('1')
  @Permission('user:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: (SearchHttpSchema.parse(query.search) as unknown as Partial<UserEntity>) || null,
      limit: Number(query.limit),
      page: Number(query.page)
    };

    return firstValueFrom(this.usersClient.send(USERS_LIST, input));
  }

  @Get('/me')
  @Version('1')
  me(@Req() { user }: ApiRequest): UserRequest {
    return user;
  }

  @Get(':id')
  @Version('1')
  @Permission('user:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.usersClient.send(USERS_GET_BY_ID, params));
  }

  @Delete(':id')
  @Version('1')
  @Permission('user:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(
      this.usersClient.send(USERS_DELETE, {
        id: params.id,
        user,
        tracing
      })
    );
  }
}
