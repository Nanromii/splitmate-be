export const AUTH_ERROR_MESSAGES = {
  GOOGLE_TOKEN_INVALID: 'Token Google không hợp lệ.',
  GOOGLE_TOKEN_EXPIRED: 'Token Google đã hết hạn.',
  GOOGLE_EMAIL_NOT_VERIFIED: 'Email Google chưa được xác minh.',
  USER_NOT_FOUND: 'Không tìm thấy người dùng.',
  USER_INACTIVE: 'Tài khoản không còn hoạt động.',
  MISSING_BEARER_TOKEN: 'Thiếu bearer token.',
  INVALID_BEARER_TOKEN: 'Bearer token không hợp lệ.',
  ACCESS_TOKEN_INVALID: 'Access token không hợp lệ.',
  REFRESH_TOKEN_INVALID: 'Refresh token không hợp lệ.',
  REFRESH_TOKEN_EXPIRED: 'Refresh token đã hết hạn.',
  SESSION_NOT_FOUND: 'Không tìm thấy phiên đăng nhập.',
  SESSION_REVOKED: 'Phiên đăng nhập đã bị thu hồi.',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn.',
  UNSUPPORTED_TOKEN_DURATION: 'Cấu hình thời hạn token không được hỗ trợ.',
  UNSUPPORTED_TOKEN_DURATION_UNIT: 'Đơn vị thời hạn token không được hỗ trợ.',
} as const;

export const GROUP_ERROR_MESSAGES = {
  GROUP_NOT_FOUND: 'Không tìm thấy nhóm.',
  GROUP_FORBIDDEN: 'Bạn không có quyền truy cập nhóm này.',
  GROUP_OWNER_REQUIRED: 'Chỉ chủ nhóm mới có quyền thực hiện thao tác này.',
  GROUP_NAME_REQUIRED: 'Tên nhóm không được để trống.',
  GROUP_CURRENCY_INVALID: 'Đơn vị tiền tệ của nhóm không hợp lệ.',
  GROUP_MEMBER_NOT_FOUND: 'Không tìm thấy thành viên trong nhóm.',
  GROUP_MEMBER_ALREADY_ACTIVE: 'Người dùng đã là thành viên của nhóm.',
  GROUP_OWNER_CANNOT_LEAVE:
    'Chủ nhóm không thể rời nhóm khi chưa chuyển quyền sở hữu.',
  GROUP_OWNER_TRANSFER_TARGET_REQUIRED:
    'Người nhận quyền sở hữu phải là thành viên đang hoạt động của nhóm.',
  GROUP_OWNER_TRANSFER_SELF: 'Bạn đang là chủ nhóm này.',
  GROUP_ALREADY_DELETED: 'Nhóm đã bị xóa.',
} as const;
