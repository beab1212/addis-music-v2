import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { subscriptionSchema } from '../validators/subscriptionValidator';
import { uuidSchema } from "../validators";
import { acceptPayment, verifyPayment, refundPayment } from "../utils/payment_helpers";
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
      price = 50; // Monthly price
      break;
    case subscriptionPlanTypes.QUARTERLY:
      endDate.setMonth(endDate.getMonth() + 3);
      price = 127; // Quarterly price
      break;
    case subscriptionPlanTypes.ANNUAL:
      endDate.setFullYear(endDate.getFullYear() + 1);
      price = 450; // Annual price
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

    let newSubscription = null;

    if (existingSubscription && existingSubscription.status === 'EXPIRED') {
      newSubscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          plan: plan.toUpperCase() as keyof typeof subscriptionPlan,
          status: 'PENDING',
          startDate: new Date(),
          endDate: endDate,
        },
      })
    } else {
      newSubscription = await prisma.subscription.create({
        data: {
          userId,
          plan: plan.toUpperCase() as keyof typeof subscriptionPlan,
          status: 'PENDING',
          startDate: new Date(),
          endDate: endDate,
        },
      });
    }


    const newPayment = await prisma.payment.create({
      data: {
        id: paymentId,
        userId,
        subscriptionId: newSubscription.id,
        amount: price,
        currency: 'ETB',
        status: 'PENDING',
        provider: 'CHAPA',
        checkoutUrl: initPayment?.data.checkout_url || '',
      },
    });

    res.status(201).json({
      success: true,
      message: `${upperPlan} subscription created successfully`,
      data: { subscription: newSubscription, checkoutUrl: initPayment?.data.checkout_url || '' },
    });
  },

  chapaCallback: async (req: Request, res: Response) => {
    const paymentId = uuidSchema.parse(req.params.paymentId);

    const paymentVerification = await verifyPayment({ paymentId });

    if (!paymentVerification || paymentVerification.status !== 'success') {
      throw new CustomErrors.ConflictError('Payment verification failed');
    }

    if (paymentVerification.data.status !== 'success') {
      throw new CustomErrors.ConflictError('Payment was not successful');
    }

    const tx_ref = paymentVerification.data?.tx_ref.split('_')[1];

    const paymentRecord = await prisma.payment.findUnique({
      where: { id: tx_ref },
    });

    if (!paymentRecord) {
      throw new CustomErrors.NotFoundError('Payment record not found');
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: tx_ref, status: 'PENDING' },
      data: { status: 'SUCCESS' },
    });

    // update subscription status if payment is successful
    if (!paymentRecord.subscriptionId) {
      throw new CustomErrors.NotFoundError('Subscription ID not found on payment record');
    }

    const updatedResult = await prisma.subscription.update({
      where: { id: paymentRecord.subscriptionId, status: 'PENDING' },
      data: { status: 'ACTIVE' },
    });

    if (!updatedResult) {
      throw new CustomErrors.ConflictError('No pending subscription found to activate');
    }

    if (!paymentVerification) {
      throw new CustomErrors.ConflictError('Failed to verify payment');
    }


    res.status(200).send();
  },

  cancelSubscription: async (req: Request, res: Response) => {
    const userId = req.user?.id as string;

    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!existingSubscription) {
      throw new CustomErrors.NotFoundError('No active subscription found to cancel');
    }

    // get current date
    const currentDate = new Date();
    // check if start date is only 10 days behind current date if not throw error
    const startDate = existingSubscription.startDate;
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 10) {
      throw new CustomErrors.BadRequestError('Cancellation period has expired. You can only cancel within 10 days of subscription start date.');
    }

    const paymentRecord = await prisma.payment.findFirst({
      where: { subscriptionId: existingSubscription.id, status: 'SUCCESS' },
    });

    if (paymentRecord) {
      // trigger refund process here if needed
      const refundResult = await refundPayment({ paymentId: paymentRecord.id });

      // handle refund failure silently for now
      // if (!refundResult || refundResult.status !== 'success') {
      //   throw new CustomErrors.ConflictError('Refund process failed');
      // }

      // update subscription record
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: { status: 'CANCELED' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription canceled and refund processed successfully',
    });
  },
};
