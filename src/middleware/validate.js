import {poolSchema, choiceSchema } from "../schemas/schema.js";

export function validatePool(req, res, next) {
  const pool = req.body;

  const validation = poolSchema.validate(pool);

  if (validation.error) {
    const errorMessage = validation.error.details[0].message;
    return res.status(422).send({ error: errorMessage });
  }

  next();
}


export function validateChoice(req, res, next) {
  const choice = req.body;

  const validation = choiceSchema.validate(choice);

  if (validation.error) {
    const errorMessage = validation.error.details[0].message;
    return res.status(422).send({ error: errorMessage });
  }

  next();
}
