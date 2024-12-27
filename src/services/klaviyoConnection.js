const axios = require('axios');

const klaviyoAPI = axios.create({
    baseURL: "https://a.klaviyo.com/api",
    headers: {
        accept: 'application/vnd.api+json',
        revision: '2024-10-15',
        'content-type': 'application/vnd.api+json',
        Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`  // Adding 'Bearer' prefix
    }
});

// Function to create a profile in Klaviyo
const createUserInKlaviyo = async ({ email, first_name, last_name, phone_number }) => {
    try {
        const profile = {
            data: {
                type: "profile",
                attributes: {
                    email,
                    first_name,
                    last_name,
                    phone_number,
                },
            },
        };

        // Check if klaviyoAPI.post automatically strings data
        const response = await klaviyoAPI.post('/profiles', JSON.stringify(profile));
        console.log("############$$$$$$$$$", response.data.data.id);
        

        const subscribe_profile = {
            "data": {
                "type": "profile-subscription-bulk-create-job",
                "attributes": {
                    "profiles": {
                        "data": [
                            {
                                "type": "profile",
                                "id": response.data.data.id,
                                "attributes": {
                                    "email": email,
                                    "subscriptions": {
                                        "email": {
                                            "marketing": {
                                                "consent": "SUBSCRIBED"
                                            }
                                        },
                                    }
                                }
                            }
                        ]
                    }
                },
                "relationships": {
                    "list": {
                        "data": {
                            "type": "list",
                            "id": "WZHkYJ"
                        }
                    }
                }
            }
        }

        await klaviyoAPI.post('/profile-subscription-bulk-create-jobs', JSON.stringify(subscribe_profile));

        return response.data;
    } catch (error) {
        console.error('Error creating Klaviyo profile:', error?.message || error);
        throw error; // Rethrow error to handle in the service layer
    }
};


const createEventInKlaviyo = async (eventName, email) => {
    try {
        const eventInKlaviyo = {
            data: {
                type: "event",
                attributes: {
                    properties: {
                        "action": eventName
                    },
                    metric: {
                        data: {
                            type: "metric",
                            attributes: {
                                name: eventName
                            }
                        }
                    },
                    profile: {
                        data: {
                            type: "profile",
                            attributes: {
                                email
                            }
                        }
                    }
                }
            }
        };

        const response = await klaviyoAPI.post('/events', JSON.stringify(eventInKlaviyo));
        return response.data;
    } catch (error) {
        console.error('Error creating Klaviyo event:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = {
    createUserInKlaviyo,
    createEventInKlaviyo
};
