import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentAuthUser } from '../../common/decorators';
import type { CurrentUser } from '../../common/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateExpenseRequestDto,
  UpdateExpenseRequestDto,
} from './dto/request';
import {
  ExpenseActionResponseDto,
  ExpenseDetailResponseDto,
  ExpenseResponseDto,
} from './dto/response';
import { ExpensesService } from './expenses.service';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('groups/:groupId/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo khoản chi EQUAL split trong nhóm' })
  @ApiBody({ type: CreateExpenseRequestDto })
  @ApiCreatedResponse({ type: ExpenseDetailResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Người dùng không thuộc nhóm.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nhóm.' })
  @ApiBadRequestResponse({ description: 'Dữ liệu khoản chi không hợp lệ.' })
  createExpense(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @Body() dto: CreateExpenseRequestDto,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<ExpenseDetailResponseDto> {
    return this.expensesService.createExpense(groupId, dto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khoản chi trong nhóm' })
  @ApiOkResponse({ type: ExpenseResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Người dùng không thuộc nhóm.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nhóm.' })
  listExpenses(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<ExpenseResponseDto[]> {
    return this.expensesService.listExpenses(groupId, currentUser);
  }

  @Get(':expenseId')
  @ApiOperation({ summary: 'Lấy chi tiết khoản chi kèm splits' })
  @ApiOkResponse({ type: ExpenseDetailResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Người dùng không thuộc nhóm.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy group hoặc expense.' })
  getExpenseDetail(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @Param('expenseId', new ParseUUIDPipe({ version: '7' })) expenseId: string,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<ExpenseDetailResponseDto> {
    return this.expensesService.getExpenseDetail(
      groupId,
      expenseId,
      currentUser,
    );
  }

  @Patch(':expenseId')
  @ApiOperation({ summary: 'Cập nhật khoản chi EQUAL split' })
  @ApiBody({ type: UpdateExpenseRequestDto })
  @ApiOkResponse({ type: ExpenseDetailResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Người dùng không thuộc nhóm.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy group hoặc expense.' })
  @ApiBadRequestResponse({ description: 'Dữ liệu cập nhật không hợp lệ.' })
  updateExpense(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @Param('expenseId', new ParseUUIDPipe({ version: '7' })) expenseId: string,
    @Body() dto: UpdateExpenseRequestDto,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<ExpenseDetailResponseDto> {
    return this.expensesService.updateExpense(
      groupId,
      expenseId,
      dto,
      currentUser,
    );
  }

  @Delete(':expenseId')
  @ApiOperation({ summary: 'Xóa mềm khoản chi và splits' })
  @ApiOkResponse({ type: ExpenseActionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Người dùng không thuộc nhóm.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy group hoặc expense.' })
  deleteExpense(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @Param('expenseId', new ParseUUIDPipe({ version: '7' })) expenseId: string,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<ExpenseActionResponseDto> {
    return this.expensesService.deleteExpense(groupId, expenseId, currentUser);
  }
}
