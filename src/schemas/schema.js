import joi from "joi";

const choiceSchema = joi.object({
  title: joi.string().required(),
  poolId: joi.string().required(),
});

const poolSchema = joi.object({
  title: joi.string().required(),
  expireAt: joi.date(),
});



export default { poolSchema, choiceSchema };

