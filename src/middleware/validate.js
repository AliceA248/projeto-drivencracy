import {poolSchema, choiceSchema } from "../schemas/schema.js";

export function validatePool(req, res, next) {
  const pool = req.body;

  const validation = poolSchema.validate(pool);

  if (validation.error) {
    return res.sendStatus(422);
  }

  next();
}


export function validateChoice(req, res, next) {
  const choice = req.body;

  const validation = choiceSchema.validate(choice);

  if (validation.error) {
    return res.sendStatus(422);
  }

  next();
}