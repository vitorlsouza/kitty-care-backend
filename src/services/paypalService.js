const axios = require('axios');

// Base URL for PayPal API
const baseURL = "https://api-m.sandbox.paypal.com/v1/billing";

// Create an instance of axios with predefined headers and baseURL
const paypalAPI = axios.create({
    baseURL: baseURL,
    headers: {
        'Authorization': `Basic ${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
    }
});

const PAYMENT_PREFERENCES = {
    auto_bill_outstanding: true,
    setup_fee: { value: "0", currency_code: "USD" },
    setup_fee_failure_action: "CONTINUE",
    payment_failure_threshold: 3
};

// Common taxes
const TAXES = { percentage: "0", inclusive: false };

const MONTHLY_PLAN = {
    product_id: "CAT_AI_SERVICE",
    name: "Monthly Subscription Plan",
    description: "Monthly plan with a 3-day free trial",
    status: "ACTIVE",
    billing_cycles: [
        {
            frequency: { interval_unit: "DAY", interval_count: 1 },
            tenure_type: "TRIAL",
            sequence: 1,
            total_cycles: 3,
            pricing_scheme: {
                fixed_price: { value: "0", currency_code: "USD" }
            }
        },
        {
            frequency: { interval_unit: "MONTH", interval_count: 1 },
            tenure_type: "REGULAR",
            sequence: 2,
            total_cycles: 12,
            pricing_scheme: {
                fixed_price: { value: "49.99", currency_code: "USD" }
            }
        }
    ],
    payment_preferences: PAYMENT_PREFERENCES,
    taxes: TAXES
};

const ANNUAL_PLAN = {
    product_id: "CAT_AI_SERVICE",
    name: "Annual Subscription Plan",
    description: "Annual plan with a 7-day free trial",
    status: "ACTIVE",
    billing_cycles: [
        {
            frequency: { interval_unit: "DAY", interval_count: 1 },
            tenure_type: "TRIAL",
            sequence: 1,
            total_cycles: 7,
            pricing_scheme: {
                fixed_price: { value: "0", currency_code: "USD" }
            }
        },
        {
            frequency: { interval_unit: "YEAR", interval_count: 1 },
            tenure_type: "REGULAR",
            sequence: 2,
            total_cycles: 1,
            pricing_scheme: {
                fixed_price: { value: "299.99", currency_code: "USD" }
            }
        }
    ],
    payment_preferences: PAYMENT_PREFERENCES,
    taxes: TAXES
};

// Service function to fetch the list of PayPal plans
const getListPlans = async () => {
    try {
        // Fetch the list of plans
        const response = await paypalAPI.get('/plans?sort_by=create_time&sort_order=desc');
        const plans = response.data.plans;
        
        // Return success response
        return {
            success: true,
            plans,
            message: "Successfully retrieved the list of plans from PayPal"
        };
    } catch (error) {
        // Handle errors and provide meaningful feedback
        console.error("Error fetching PayPal plans:", error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch the list of plans from PayPal"
        };
    }
};

// Function to create a PayPal billing plan
const createBillingPlan = async (planPeriod) => {
    const planDetails = planPeriod === "Monthly" ? MONTHLY_PLAN : ANNUAL_PLAN;

    paypalAPI.defaults.headers['PayPal-Request-Id'] = `PLAN-${Date.now()}`;

    try {
        const response = await paypalAPI.post(
            "/plans",
            planDetails,
        );
        return {
            success: true,
            plan: response.data,
            message: "Plan created successfully"
        };
    } catch (error) {
        console.error("Error creating billing plan:", error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to create billing plan"
        };
    }
};

// Function to create a subscription
const createSubscription = async (planId, subscriberDetails, returnUrl, cancelUrl) => {
    try {
        paypalAPI.defaults.headers['PayPal-Request-Id'] = `SUBSCRIPTION-${Date.now()}`;

        const response = await paypalAPI.post(
            '/subscriptions',
            {
                plan_id: planId,
                start_time: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // Start in 1 hour
                subscriber: subscriberDetails,
                application_context: {
                    brand_name: "YourBrandName",
                    locale: "en-US",
                    shipping_preference: "SET_PROVIDED_ADDRESS",
                    user_action: "SUBSCRIBE_NOW",
                    payment_method: {
                        payer_selected: "PAYPAL",
                        payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
                    },
                    return_url: returnUrl,
                    cancel_url: cancelUrl,
                },
            },
        );

        return {
            success: true,
            subscription: response.data,
            message: "Subscription created successfully",
        };
    } catch (error) {
        console.error("Error creating subscription:", error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to create subscription",
        };
    }
};

const cancelSubscription = async (id, reason) => {
    try {
        await paypalAPI.post(`subscriptions/${id}/cancel`, reason);

        return {
            success: true,
            message: "Subscription canceled successfully",
        };
    } catch (error) {
        console.error("Error canceling subscription:", error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to cancel subscription",
        };
    }
}

module.exports = {
    getListPlans,
    createBillingPlan,
    createSubscription,
    cancelSubscription
};
