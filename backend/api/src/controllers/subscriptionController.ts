import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { subscriptionSchema } from '../validators/subscriptionValidator';
import { uuidSchema } from "../validators";
import { acceptPayment, verifyPayment } from "../utils/payment_helpers";
import { v4 as uuid4 } from "uuid";

const subscriptionPlan = {
    FAMILY: 'family',
    PREMIUM: 'premium',
    FREE: 'free',
}

const subscriptionPlanTypes = {
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    ANNUAL: 'annual',
}

const getEndDateAndPrice = (startDate: Date, planType: string, plan: string): { endDate: Date; price: number } => {
    const endDate = new Date(startDate);
    let price = 0;

    if (plan !== subscriptionPlan.PREMIUM) {
        throw new CustomErrors.BadRequestError('Pricing is only defined for PREMIUM plan');
    }

    switch (planType) {
        case subscriptionPlanTypes.MONTHLY:
            endDate.setMonth(endDate.getMonth() + 1);
            price = 100; // Monthly price
            break;
        case subscriptionPlanTypes.QUARTERLY:
            endDate.setMonth(endDate.getMonth() + 3);
            price = 250; // Quarterly price
            break;
        case subscriptionPlanTypes.ANNUAL:
            endDate.setFullYear(endDate.getFullYear() + 1);
            price = 800; // Annual price
            break;
        default:
            throw new Error('Invalid plan type');
    }
    return { endDate, price };
}


const allowedCurrencies = ['USD', 'ETB'];

export const subscriptionController = {
  createSubscription: async (req: Request, res: Response) => {
    const { plan, planType } = subscriptionSchema.parse(req.body);
    const userId = req.user?.id as string;

    if (!Object.values(subscriptionPlan).includes(plan)) {
      throw new CustomErrors.BadRequestError('Invalid subscription plan');
    }

    if (!Object.values(subscriptionPlanTypes).includes(planType)) {
      throw new CustomErrors.BadRequestError('Invalid subscription plan type');
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (existingSubscription && existingSubscription.status === 'PENDING') {
      throw new CustomErrors.ConflictError('User already has a pending subscription');
    }

    if (existingSubscription && existingSubscription.status === 'ACTIVE') {
      throw new CustomErrors.ConflictError('User already has an active subscription');
    }

    const upperPlan = plan.toUpperCase();
    const { endDate, price } = getEndDateAndPrice(new Date(), planType, plan);

    const paymentId = uuid4();

    const initPayment = await acceptPayment({
      amount: price,
      user: req.user!,
      paymentId: paymentId,
    });

    if (!initPayment) {
      throw new CustomErrors.ConflictError('Failed to initialize payment');
    }

    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        plan: plan.toUpperCase() as keyof typeof subscriptionPlan,
        status: 'PENDING',
        startDate: new Date(),
        endDate: endDate,
      },
    });

    const newPayment = await prisma.payment.create({
      data: {
        id: paymentId,
        userId,
        subscriptionId: newSubscription.id,
        amount: price,
        currency: 'ETB',
        status: 'PENDING',
        provider: 'CHAPA',
        checkoutUrl: initPayment?.data.checkoutUrl || '',
      },
    });

    res.status(201).json({
      success: true,
      message: `${upperPlan} subscription created successfully`,
      data: { subscription: newSubscription, checkoutUrl: newPayment.checkoutUrl },
    });
  },

  chapaCallback: async (req: Request, res: Response) => {
    const paymentId = uuidSchema.parse(req.params.paymentId);

    console.log("Payment Id: ", paymentId);
    

    const paymentVerification = await verifyPayment({ paymentId });
    
    if (!paymentVerification) {
      throw new CustomErrors.ConflictError('Failed to verify payment');
    }

    
    res.status(200).send();
  }
};
