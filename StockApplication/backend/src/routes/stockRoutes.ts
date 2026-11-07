import { Router } from "express";
import { getStockSummary } from "../controllers/stockController.js";

const router = Router();

router.get("/:symbol/summary", (req, res) => {
    const symbol = req.params.symbol;

    if (!/^[A-Za-z0-9.^=_-]{1,20}$/.test(symbol)) {
        res.status(400).json({
            error: "Invalid stock symbol."
        });
        return;
    }

    return getStockSummary(req, res);
});

export default router;