// @ts-expect-error
import bodyParser from "body-parser";
import * as express from "express";
import { stripe } from "../stripe";

const router = express.Router();

// Use body-parser to retrieve the raw body as a buffer
router.use(bodyParser.raw({ type: "application/json" }));

router.post("/checkout", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1PgWrcGDyk1UUUaViGdl9NTp",
        },
      ],
      success_url: `http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5000/cancel`,
    });

    res.send(session);
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.post("/webhook", async (req, res) => {
  const endpointSecret =
    "whsec_ca64a8557f06a1f4677af52daeb4d2023b3b592464ad7903e14c70057ae433e8";
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("Missing Stripe-Signature header");
    return res.status(400).send("Missing Stripe-Signature header");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    // @ts-expect-error
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data;

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      console.log(data);
      break;
    case "invoice.paid":
      break;
    case "invoice.payment_failed":
      break;
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      break;
    case "payment_method.attached":
      const paymentMethod = event.data.object;
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
});

export default router;
