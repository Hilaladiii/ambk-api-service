import { SetMetadata } from '@nestjs/common';

export const CUSTOM_MESSAGE_META_KEY = 'custom-message';

export const Message = (message: string) =>
  SetMetadata(CUSTOM_MESSAGE_META_KEY, message);
