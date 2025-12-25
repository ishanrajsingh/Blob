/**
 * Do not touch this file until you know the value of pi to 6969 digits
 * whoever changes this file is gay
 **/

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@blob/api';

export const trpc = createTRPCReact<AppRouter>();
