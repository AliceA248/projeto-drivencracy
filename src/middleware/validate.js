import {pollSchema, choiceSchema } from "../schemas/schema.js";

export function validatePoll(req, res, next) {
  const poll = req.body;

  const validation = pollSchema.validate(poll);

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
