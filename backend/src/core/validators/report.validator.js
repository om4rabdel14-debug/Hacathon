const { z } = require('zod');
const { STATUS_LIST } = require('../constants/reportStatus');

const createReportSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  lat: z
    .preprocess((v) => parseFloat(v), z.number().min(-90).max(90)),
  lng: z
    .preprocess((v) => parseFloat(v), z.number().min(-180).max(180)),
  citizen_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .default('Anonymous'),
  citizen_email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  address: z.string().max(500).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(STATUS_LIST, { message: 'Invalid status value' }),
  note: z.string().max(1000).optional(),
});

const addNoteSchema = z.object({
  note: z
    .string()
    .min(1, 'Note cannot be empty')
    .max(1000, 'Note must be at most 1000 characters'),
});

module.exports = { createReportSchema, updateStatusSchema, addNoteSchema };
