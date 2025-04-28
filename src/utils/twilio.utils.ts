import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendTwilioSMS = async (to: string, body: string) => {
  try {
    const message = await client.messages.create({
      to: to,
      from: fromPhoneNumber,
      body: body,
    });
    return message;
  } catch (error: any) {
    console.error('Error sending SMS:', error.message || error);
    throw error;
  }
};
