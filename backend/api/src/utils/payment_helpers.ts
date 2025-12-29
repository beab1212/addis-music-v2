import { axiosClient } from "../libs/axios";
import config from "../config/config";

const acceptPayment = async ({ user, amount, paymentId }: { user: any, amount: number, paymentId: string }) => {
    try {
        const options = {
            method: 'POST',
            url: 'https://api.chapa.co/v1/transaction/initialize',
            headers: {
                'Authorization': `Bearer ${config.chapa.apiKey}`,
                'Content-Type': 'application/json'
            },
            data: {
                "amount": amount.toString(),
                "currency": "ETB",
                "email": user.email,
                "first_name": user.name,
                "last_name": user.lastName || '',
                "phone_number": user.phoneNumber || '',
                "tx_ref": `payment_${paymentId}`,
                "callback_url": `${config.chapa.callbackUrl}/${paymentId}`,
                "return_url": config.chapa.returnUrl,
                "customization[title]": "Payment for Addis Music",
                "customization[description]": "Experience the best music platform in Ethiopia without ads.",
                "meta[hide_receipt]": "true"
            }
        }

        const response = await axiosClient.request(options);
        return response.data;
    } catch (error) {
        console.error('Error initializing payment:', error);
        return null;
    }
};


const verifyPayment = async ({ paymentId }: { paymentId: string }) => {
    try {
        const options = {
            method: 'GET',
            url: `https://api.chapa.co/v1/transaction/verify/payment_${paymentId}`,
            headers: {
                'Authorization': 'Bearer ' + config.chapa.apiKey,
                'Content-Type': 'application/json'
            }
        }

        const response = await axiosClient.request(options);
        return response.data;
    } catch (error) {
        console.error('Error verifying payment:', error);
        return null;
    }
};

const refundPayment = async ({ paymentId }: { paymentId: string }) => {
    try {
        const options = {
            method: 'POST',
            url: `https://api.chapa.co/v1/refund/payment_${paymentId}`,
            headers: {
                'Authorization': 'Bearer ' + config.chapa.apiKey,
                'Content-Type': 'application/json'
            },
            data: {
                "reason": "User requested refund"
            }
        }

        const response = await axiosClient.request(options);
        return response.data;
    } catch (error) {
        console.error('Error refunding payment:', error);
        return null;
    }
};

export {
    acceptPayment,
    verifyPayment,
    refundPayment
};
