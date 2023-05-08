import { Router } from "express";
import { sendChoice, addVote } from "../controllers/choice.js";
import { validatePoll, validateChoice } from '../middleware/validate.js';
import {
  sendPoll,
  getPoll,
  getPollChoices,
  getPollResults,
} from "../controllers/poll.js";



// choice

const choiceRouter = Router();

choiceRouter.post("/choice", validateChoice, sendChoice);
choiceRouter.post("/choice/:id/vote", addVote);

// poll


const pollRouter = Router();

pollRouter.post("/poll", validatePoll, sendPoll);

pollRouter.get("/poll", getPoll);

pollRouter.get("/poll/:id/choice/", getPollChoices);

pollRouter.get("/poll/:id/result", getPollResults);


// routes

const router = Router();

router.use(pollRouter);
router.use(choiceRouter);

export default router;


export { pollRouter, choiceRouter, router };

