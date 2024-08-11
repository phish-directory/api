import bodyParser from "body-parser";
import * as express from "express";

import metrics from "../metrics";
import { stripe, stripeEndpointSecret, stripePriceId } from "../stripe";

const router = express.Router();

// Use body-parser to retrieve the raw body as a buffer
router.use(bodyParser.raw({ type: "application/json" }));

router.post("/checkout", async (req, res) => {
  metrics.increment("endpoint.stripe.checkout");
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
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
  metrics.increment("endpoint.stripe.webhook");

  const endpointSecret = stripeEndpointSecret;
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
      // Data included in the event object:
      const customerId = data.object.customer;
      const subscriptionId = data.object.subscription;

      console.log(
        `💰 Customer ${customerId} subscribed to plan ${subscriptionId}`
      );

      // Get the subscription. The first item is the plan the user subscribed to.
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const itemId = subscription.items.data[0].id;

      // Generate API key
      // const { apiKey, hashedAPIKey } = generateAPIKey();
      // console.log(`User's API Key: ${apiKey}`);
      // console.log(`Hashed API Key: ${hashedAPIKey}`);

      // Store the API key in your database.
      // customers[customerId] = { apikey: hashedAPIKey, itemId, active: true };
      // apiKeys[hashedAPIKey] = customerId;

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
