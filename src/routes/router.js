import { Router } from "express";
import { sendChoice, addVote } from "../controllers/choice.js";
import { validatePool, validateChoice } from '../middleware/validate.js';
import {
  sendPool,
  getPool,
  getPoolChoices,
  getPoolResults,
} from "../controllers/pool.js";



// choice

const choiceRouter = Router();

choiceRouter.post("/choice", validateChoice, sendChoice);
choiceRouter.post("/choice/:id/vote", addVote);

// poll


const poolRouter = Router();

poolRouter.post("/pool", validatePool, sendPool);

poolRouter.get("/pool", getPool);

poolRouter.get("/pool/:id/choice/", getPoolChoices);

poolRouter.get("/pool/:id/result", getPoolResults);


// routes

const router = Router();

router.use(poolRouter);
router.use(choiceRouter);

export default router;


export { poolRouter, choiceRouter, router };

