// @ts-nocheck
// @ts-nocheck
// @ts-nocheck
import { Router } from "express";
import { SubmitFeedbackBody } from "@workspace/api-zod";

const router = Router();

router.post("/feedback", (req, res) => {
  const parsed = SubmitFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  req.log.info({ messageId: parsed.data.messageId, rating: parsed.data.rating }, "Feedback received");
  res.json({ success: true });
});

export default router;
