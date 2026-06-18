import {Safepay} from "@sfpy/node-sdk";

export const safepay = new Safepay({
  environment: process.env.SAFEPAY_ENV || "sandbox",
  apiKey: process.env.SAFEPAY_API_KEY,
  v1Secret: process.env.SAFEPAY_SECRET_KEY,
  webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET,
});

export const createPaymentSession = async ({
  amount,
  currency = "PKR",
}) => {
  const { token } = await safepay.payments.create({
    amount: Number(amount),
    currency,
  });

  return token;
};

export const createCheckoutURL = async ({
  orderId,
  amount,
  currency = "PKR",
}) => {

  const token = await createPaymentSession({amount})

  const url = safepay.checkout.create({
    token,
    orderId,

    cancelUrl:
      "http:localhost:5173/payment/cancel",

    redirectUrl:
      "http:localhost:5173/payment/success",

    source: "custom",

    webhooks: true,
  });

  return {
    token,
    url,
  };
};

export const verifyWebhook = (req) => {
  return safepay.verify.webhook(req);
};


export const processRefund = async(trackerToken, amount, currency = 'PKR') => {
  try {
    // Execute the refund request
    const refundResponse = await safepay.payments.refund({
      tracker: trackerToken, // The unique payment reference code
      amount: amount,        // Can be the full amount or a partial amount
      currency: currency
    });

    console.log('Refund Processed Successfully:', refundResponse);
    return refundResponse;

  } catch (error) {
    console.error('Error executing Safepay refund:', error.message);
    throw error;
  }
}