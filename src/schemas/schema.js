import joi from "joi";

export const choiceSchema = joi.object({
  title: joi.string().required(),
  pollId: joi.string().required(),
});

export const pollSchema = joi.object({
  title: joi.string().required(),
  expireAt: joi.date(),
});


