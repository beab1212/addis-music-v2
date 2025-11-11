import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { subscriptionSchema } from '../validators/subscriptionValidator';

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

    if (existingSubscription) {
      throw new CustomErrors.ConflictError('User already has an active subscription');
    }

    const upperPlan = plan.toUpperCase();

    // const newSubscription = await prisma.subscription.create({
    //   data: {
    //     userId,
    //     plan: plan.toUpperCase() as keyof typeof subscriptionPlan,
    //     status: 'PENDING',
    //     startDate: new Date(),
    //     endDate: null,
    //   },
    // });

    // create a payment record associated with the subscription
    // calculate amount based on plan and planType
    let amount = 0;
    
    // create a payment record associated with the subscription


    // and redirect user to payment gateway

    res.status(201).json({
      success: true,
      message: `${upperPlan} subscription created successfully`,
      data: { subscription: "newSubscription" },
    });
  },
};
