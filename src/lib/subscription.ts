import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return false;
    }

    const userSubscription = await prisma.subscription.findUnique({
        where: {
            userId: (session.user as any).id,
        },
        select: {
            stripeSubscriptionId: true,
            currentPeriodEnd: true,
            stripeCustomerId: true,
            stripePriceId: true,
            status: true
        },
    });

    if (!userSubscription) {
        return false;
    }

    const isValid =
        userSubscription.stripePriceId &&
        userSubscription.currentPeriodEnd.getTime() + DAY_IN_MS > Date.now();

    return !!isValid;
};
