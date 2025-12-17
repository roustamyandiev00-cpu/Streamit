import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma"; // Assuming prisma is exported from here, need to verify
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || !session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { priceId } = await req.json();

        // Default to Pro plan price ID from env if not provided
        const targetPriceId = priceId || process.env.STRIPE_PRO_PRICE_ID;

        if (!targetPriceId) {
            return new NextResponse("Price ID configuration missing", { status: 500 });
        }

        const dbUser = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            include: {
                subscription: true,
            }
        });

        if (!dbUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // If already subscribed to this plan, redirect to billing portal
        if (dbUser.subscription?.stripeSubscriptionId && dbUser.subscription?.plan === 'PRO') {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: dbUser.subscription.stripeCustomerId!,
                return_url: settingsUrl,
            });
            return NextResponse.json({ url: stripeSession.url });
        }

        // Create Checkout Session
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: settingsUrl,
            cancel_url: settingsUrl,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: dbUser.email,
            line_items: [
                {
                    price: targetPriceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: dbUser.id,
            },
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        console.log("[STRIPE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
