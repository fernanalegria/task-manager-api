const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.EMAIL_SERVICE_KEY);

const sendWelcomeEmail = (email, name) =>
  sgMail.send({
    to: email,
    from: "fernanalegria@gmail.com",
    subject: "Welcome to Task Manager API!",
    text: `Welcome to Task Manager API, ${name}.
    
            Let us know how you get along with the app.
            
            Thank you,
            the Task Manager API team.`
  });

const sendGoodByeMail = (email, name) =>
  sgMail.send({
    to: email,
    from: "fernanalegria@gmail.com",
    subject: "We are sad to see you go :(",
    text: `Hi ${name},
            
            We have seen you have recently cancelled your Task Manager API account.
            
            We are sad to see you go and would like to know your feedback.
            
            Thank you,
            the Task Manager API team.`
  });

module.exports = {
  sendWelcomeEmail,
  sendGoodByeMail
};
