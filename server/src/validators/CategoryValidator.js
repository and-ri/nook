import { z } from 'zod';

const schemaAdd = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
});

const schemaUpdate = schemaAdd.partial();

const schema = {
    add: schemaAdd,
    update: schemaUpdate,
};

export const CategoryValidator = schema;