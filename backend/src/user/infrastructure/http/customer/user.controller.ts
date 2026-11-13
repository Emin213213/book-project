// import {
//     Controller,
//     Get,
//     Post,
//     Put,
//     Delete,
//     Param,
//     Body,
//     Query,
//     ParseUUIDPipe,
//     HttpCode, Inject, UseGuards,
// } from '@nestjs/common';
// import {EntityManager} from 'typeorm';
// import {FindAllUsersAction} from '../../../application/actions/find-all-users.action';
// import {CreateUserAction} from '../../../application/actions/create-user.action';
// import {DeleteUserAction} from '../../../application/actions/delete-user.action';
// import {CreateUserDto} from '../../../application/dto/create-user.dto';
// import {UpdateUserDto} from '../../../application/dto/update-user.dto';
// import {ListUsersDto} from '../../../application/dto/list-users.dto';
// import {PaginatedResource} from '@/common/infrastructure/http/resources/paginated.resource';
// import {ResourceNotExistsException} from '@/common/domain/exceptions/resource-not-exists.exception';
// import {ErrorCode} from '../../../domain/exceptions/error-code.enum';
// import {User} from '../../../domain/entities/user.entity';
// import {UserResource} from '@/user/infrastructure/http/customer/resources/user.resource';
// import {IUserRepository, USER_REPOSITORY} from "@/user/domain/repositories/user.repository.interface";
// import {
//     ApiBasicAuth,
//     ApiBearerAuth,
//     ApiConsumes,
//     ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse,
//     ApiOperation,
//     ApiParam,
//     ApiUnauthorizedResponse
// } from "@nestjs/swagger";
// import {TokenHasher} from "@/user/application/services/token.hasher";
// import {AuthGuard} from "@/user/infrastructure/http/guards/auth.guard";
//
// @Controller('users')
// export class UserController {
//     constructor(
//         private readonly em: EntityManager,
//         @Inject(USER_REPOSITORY)
//         private readonly userRepository: IUserRepository,
//         private readonly findAllUsers: FindAllUsersAction,
//         private readonly createUser: CreateUserAction,
//         private readonly deleteUser: DeleteUserAction,
//         @Inject() private readonly tokenHasher: TokenHasher,
//     ) {
//     }
//
//
//     @Post()
//     @ApiConsumes()
//     @ApiBearerAuth()
//     @ApiBasicAuth()
//     @ApiCreatedResponse({
//         description: 'Creates a new user and returns the created user data',
//         type: CreateUserDto
//
//     })
//     @ApiUnauthorizedResponse({
//         description: 'Authentication is required or the provided credentials are invalid.',
//     })
//     @ApiNotFoundResponse({
//         description: 'The requested resource was not found.',
//         examples: {
//             categoryNotFound: {
//                 summary: 'Category not found',
//                 value: {
//                     statusCode: 404,
//                     message: 'Category not found',
//                     error: 'Not Found'
//                 }
//             },
//             userNotFound: {
//                 summary: 'User not found',
//                 value: {
//                     statusCode: 404,
//                     message: 'User not found',
//                     error: 'Not Found',
//                 },
//             }
//         }
//     })
//     @ApiOkResponse({
//         description: 'Request completed successfully.',
//         type: CreateUserDto
//     })
//     @ApiOperation({
//         operationId: 'admin.book.category.create',
//         summary: 'Create',
//         description: `<small>
//
//
// > ## Validation Rules
// >
// > - Required fields must be provided.
// > - The slug must be unique.
// > - Invalid data will result in a **400 Bad Request** response.
//
// </small>`
//
//     })
//
//
//     async register(@Body() context: CreateUserDto) {
//         const {user} = await this.createUser.handle(context);
//
//         return UserResource.make(user);
//     }
// }


