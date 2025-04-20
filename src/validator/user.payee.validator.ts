import Joi from "joi";

export const userPayeePostSchema = Joi.object({
    payeeId: Joi.string().required(),
});
