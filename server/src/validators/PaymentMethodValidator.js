import { z } from 'zod';

const TYPES = ['card', 'bank', 'wallet', 'crypto', 'other'];

const schemaAdd = z.object({
    name:    z.string().min(1, 'Name is required').max(100),
    type:    z.enum(TYPES, { error: `Type must be one of: ${TYPES.join(', ')}` }).default('card'),
    logoUrl: z.url('Logo URL must be a valid URL').optional().or(z.literal('')),
});

const schemaUpdate = schemaAdd.partial();

export const PaymentMethodValidator = { add: schemaAdd, update: schemaUpdate };
