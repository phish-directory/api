import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SK_KEY!, {
  apiVersion: "2024-06-20",
});

let stripeProductId: string;
let stripePriceId: string;
let stripeEndpointSecret: string;
let stripeMeterId: string;

if (process.env.NODE_ENV === "production") {
  stripeProductId = process.env.STRIPE_PRODUCT_ID!;
  stripePriceId = process.env.STRIPE_PRICE_ID!;
  stripeEndpointSecret = process.env.STRIPE_ENDPOINT_SECRET!;
  stripeMeterId = process.env.STRIPE_METER_ID!;
} else {
  stripeProductId = "prod_QXc5hDUjItP16a";
  stripePriceId = "price_1PgWrcGDyk1UUUaViGdl9NTp";
  stripeEndpointSecret =
    "whsec_ca64a8557f06a1f4677af52daeb4d2023b3b592464ad7903e14c70057ae433e8";
  stripeMeterId = "mtr_test_61Qpvz00X0w37791V41GDyk1UUUaVOhM";
}

async function getCustomerUsage(customerId: string) {
  let beginning = 1721940357677;
  let now = new Date().getTime();

  const usageRecords = await stripe.billing.meters.listEventSummaries(
    stripeMeterId,
    {
      customer: customerId,
      start_time: beginning,
      end_time: now,
    }
  );

  console.log(usageRecords.data);
}

export {
  getCustomerUsage,
  stripeEndpointSecret,
  stripePriceId,
  stripeProductId,
};
