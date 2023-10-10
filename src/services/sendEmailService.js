// Import the 'nodemailer' module
import nodemailer from "nodemailer";

// Define an asynchronous function named 'sendEmailService' which takes an object as an argument.
// The object has default values for properties: 'to', 'subject', 'message', and 'attachments'.
export async function sendEmailService({
  to, // 'to' specifies the recipient's email address.
  subject, // 'subject' specifies the email subject.
  message, // 'message' specifies the content of the email.
  attachments = [], // 'attachments' is an array that can contain attachments for the email. Default is an empty array.
} = {}) {
  // Create email configurations using 'nodemailer'
  const transporter = nodemailer.createTransport({
    host: "localhost", // The hostname of the email server.
    port: 587, // The port to be used for sending emails.
    secure: false, // Specifies if the connection should use SSL/TLS (false for non-secure).
    service: "gmail", // Specifies the email service to be used (in this case, Gmail).
    auth: {
      user: "mohamedsalamaaa@gmail.com", // The sender's email address.
      pass: "stxytqhqshblivye", // The sender's email password or an app-specific password.
    },
  });

  // Compose email information using the configured transporter
  const emailInfo = await transporter.sendMail({
    from: '"Fred Foo 👻" <mohamedsalamaaa@gmail.com>', // The sender's name and email address.
    to: to ? to : "", // The recipient's email address (default is an empty string).
    subject: subject ? subject : "Hello", // The email subject (default is 'Hello').
    html: message ? message : "", // The HTML content of the email (default is an empty string).
    attachments, // Attachments to be included in the email.
  });

  // Check if the email was accepted by the recipient's server
  if (emailInfo.accepted.length) {
    return true; // If accepted, return true.
  }
  return false; // If not accepted, return false.
}
