import joi from "joi";

export const choiceSchema = joi.object({
  title: joi.string().required(),
  poolId: joi.string().required(),
});

export const poolSchema = joi.object({
  title: joi.string().required(),
  expireAt: joi.date(),
});


