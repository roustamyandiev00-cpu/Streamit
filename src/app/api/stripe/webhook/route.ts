import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        ) as any;

        if (!session?.metadata?.userId) {
            return new NextResponse("User id is required", { status: 400 });
        }

        await prisma.subscription.create({
            data: {
                userId: session.metadata.userId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                currentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                ),
                status: subscription.status.toUpperCase(), // ACTIVE, etc.
                plan: "PRO",
            },
        });
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        ) as any;

        // Update existing subscription
        // We need to find the subscription by stripeSubscriptionId
        await prisma.subscription.updateMany({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                currentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                ),
                status: subscription.status.toUpperCase(),
            },
        });
    }

    return new NextResponse(null, { status: 200 });
}
