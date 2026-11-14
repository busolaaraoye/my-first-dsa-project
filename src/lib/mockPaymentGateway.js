export function createMockPaymentGateway() {

    return {
        async charge(paymentToken) {

            if (paymentToken === "tok_success") {
                return {
                    success: true,
                    reference: `PAY-${Date.now()}`,
                };
            }

            if (paymentToken === "tok_declined") {
                return {
                    success: false,
                    code: "PAYMENT_DECLINED",
                    message: "Payment was declined",
                };
            }

            return {
                success: false,
                code: "PAYMENT_DECLINED",
                message: "Invalid payment token",
            };
        },
    };
}