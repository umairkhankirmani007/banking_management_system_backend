import Joi from "joi";

export const activityPostSchema = Joi.object({
    activity: Joi.object().required(),
});
