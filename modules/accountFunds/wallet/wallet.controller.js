import * as walletService from "./wallet.service.js";

/* =========================
   GET MY WALLET (STATE ONLY)
========================= */
export const getMyWallet = async (req, res) => {
  const result = await walletService.getMyWallet({
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Wallet fetched successfully",
    data: result
  });
};