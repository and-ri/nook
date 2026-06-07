import { z } from 'zod';

const schemaAdd = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  amount: z.number({ invalid_type_error: 'Amount must be a number' }),
  currency: z.string().min(1, 'Currency is required').max(10, 'Currency must be less than 10 characters'),
  billingCycle: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], { errorMap: () => ({ message: 'Billing cycle is required and must be one of DAILY, WEEKLY, MONTHLY, YEARLY' }) }),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED', 'TRIAL'], { errorMap: () => ({ message: 'Status is required and must be one of ACTIVE, PAUSED, CANCELLED, TRIAL' }) }),
  url: z.string().url('URL must be a valid URL').optional(),
  logoUrl: z.string().url('Logo URL must be a valid URL').optional(),
  startDate: z.coerce.date({ invalid_type_error: 'Start date must be a valid date' }).optional(),
  nextBillingDate: z.coerce.date({ invalid_type_error: 'Next billing date must be a valid date' }).optional(),
  cancelledAt: z.coerce.date({ invalid_type_error: 'Cancelled at must be a valid date' }).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  categories: z.array(z.string().uuid('Each category ID must be a valid UUID')).optional(),
});

const schemaUpdate = schemaAdd.partial();

const schema = {
    add: schemaAdd,
    update: schemaUpdate,
};

export const SubscribtionValidator = schema;