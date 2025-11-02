import { EventEmitter } from "events";
import { sendEmail, emailSubject } from "../Emails/email.utils.js";
import { template } from "../Emails/generateHTML.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("confirmEmail", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.confirmEmail,
    html: template(data.otp, data.firstName),
  }).catch((err) => {
    console.log(`Error in sending confirmation email: ${err}`);
  });
});

eventEmitter.on("forgotPassword", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.resetPassword,
    html: template(data.otp, data.firstName, emailSubject.resetPassword),
  }).catch((err) => {
    console.log(`Error in sending confirmation email: ${err}`);
  });
});

export default eventEmitter;
