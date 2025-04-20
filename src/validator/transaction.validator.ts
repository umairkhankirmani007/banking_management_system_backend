import Joi from "joi";

export const transactionSchema = Joi.object({
  amount: Joi.number().required(),
  recipientId: Joi.string().required(),
  message: Joi.string().optional(),
});

export const transactionTopUpSchema = Joi.object({
  amount: Joi.number().required(),
});
