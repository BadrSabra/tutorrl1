// @ts-nocheck
// @ts-nocheck
import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import feedbackRouter from "./feedback";
import assessRouter from "./assess";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(feedbackRouter);
router.use(assessRouter);

export default router;
