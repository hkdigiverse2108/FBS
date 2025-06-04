"use strict"

import AWS from 'aws-sdk'
import nodemailer from 'nodemailer';
import { config } from '../../config';


const ses = new AWS.SES()

const mail: any = config.MAIL;
// const option: any = {
//     service: "gmail",
//     host: "smtp.gmail.com",
//     port: 587,
//     requireTLS: true,
//     secure: false,
//     auth: {
//         user: mail.MAIL,
//         pass: mail.PASSWORD,
//     },
// }
const option: any = {
    service: "gmail",
    host: 'smtp.gmail.com',
    port: 465,
    tls: {
        //     enable: true,
        rejectUnauthorized: false
    },
    // requireTLS: true,
    // secure: false,
    auth: {
        user: mail.MAIL,
        pass: mail.PASSWORD,
    },
}
const transPorter = nodemailer.createTransport(option)
// const params = {

// export const forgot_password_mail = async (user: any, otp: any) => {
//     return new Promise(async (resolve, reject) => {
//         var params = {
//             Destination: {
//                 ToAddresses: [user.email]
//             },
//             Message: {
//                 Body: {
//                     Html: {
//                         Charset: "UTF-8",
//                         Data: `<html lang="en-US">

//                         <head>
//                             <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
//                             <title>Forgot password</title>
//                             <meta name="description" content="Forgot password.">
//                             <style type="text/css">
//                                 a:hover {
//                                     text-decoration: underline !important;
//                                 }
//                             </style>
//                         </head>
                        
//                         <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
//                             <!--100% body table-->
//                             <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
//                                 style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
//                                 <tr>
//                                     <td>
//                                         <table style="background-color: #f2f3f8; max-width:700px;  margin:0 auto;" width="100%" border="0"
//                                             align="center" cellpadding="0" cellspacing="0">
//                                             <tr>
//                                                 <td style="height:80px;">&nbsp;</td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="text-align:center;">
//                                                     <h1
//                                                         style="color:#F43939; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
//                                                         SquadCard</h1>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="height:20px;">&nbsp;</td>
//                                             </tr>
//                                             <tr>
//                                                 <td>
//                                                     <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
//                                                         style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
//                                                         <tr>
//                                                             <td style="height:40px;">&nbsp;</td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td style="padding:0 35px;">
//                                                                 <h1
//                                                                     style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
//                                                                     Forgot password</h1>
//                                                                 <span
//                                                                     style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
//                                                                 <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
//                                                                     Hi ${user.firstName}
//                                                                     <br>
//                                                                     Someone, hopefully you, has requested to reset the password for your
//                                                                     SquadCard account.
//                                                                     <br>
//                                                                     OTP will expire in 10 minutes.
//                                                                     <br>
//                                                                     Verification code: ${otp}
//                                                                     <br>
//                                                                     <br>
//                                                                     The SquadCard Team
//                                                                 </p>
                        
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td style="height:40px;">&nbsp;</td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             <tr>
//                                                 <td style="height:20px;">&nbsp;</td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="text-align:center;">
//                                                     <strong></strong></p>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="height:80px;">&nbsp;</td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>
//                             <!--/100% body table-->
//                         </body>
                        
//                         </html>
//                          `
//                     }
//                 },
//                 Subject: {
//                     Charset: "UTF-8",
//                     Data: "Forgot password"
//                 }
//             },
//             ReplyToAddresses: [config.AWS_REPLY_ADDRESS],
//             Source: config.AWS_MAIL,
//         };
//         await ses.sendEmail(params, function (err, data) {
//             if (err) {
//                 reject(err); // an error occurred
//             }
//             else {
//                 resolve(`Email has been sent to ${user.email}, kindly follow the instructions`);
//             }      // successful response
//         });
//     })
// }

export const email_verification_mail = async (user: any, otp: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const mailOptions = {
                from: mail.MAIL, // sender address
                to: user.email, // list of receivers
                subject: "Email verification",
                html: `<html lang="en-US">
    
                <head>
                    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                    <title>Email Verification</title>
                    <meta name="description" content="Email Verification.">
                    <style type="text/css">
                        a:hover {
                            text-decoration: underline !important;
                        }
                    </style>
                </head>
    
                <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                    <!--100% body table-->
                    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                        <tr>
                            <td>
                                <table style="background-color: #f2f3f8; max-width:700px;  margin:0 auto;" width="100%" border="0"
                                    align="center" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="height:80px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="text-align:center;">
                                            <h1
                                                style="color:#F43939; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
                                                Zazzi App</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:20px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:0 35px;">
                                                        <h1
                                                            style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
                                                            Email Verification</h1>
                                                        <span
                                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                            Hi ${(user.firstName != null ? user.firstName : 'dear')} ${(user.lastName != null ? user.lastName : '')}, 
                                                            <br>
                                                            Someone, hopefully you, has requested to new account in Zazzi app
                                                            <br>
                                                            OTP will expire in 10 minutes.
                                                            <br>
                                                            Verification code: ${otp}
                                                            <br>
                                                            <br>
                                                            The Zazzi App Team
                                                        </p>
    
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                            </table>
                                        </td>
                                    <tr>
                                        <td style="height:20px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="text-align:center;">
                                            <strong></strong></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:80px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <!--/100% body table-->
                </body>
    
                </html>`, // html body
            };
            await transPorter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    resolve(`Email has been sent to ${user.email}, kindly follow the instructions`)
                }
            })
        } catch (error) {
            console.log(error)
            reject(error)
        }
    });
}
// export const send_squadCard_mail = async (user: any) => {
//     return new Promise(async (resolve, reject) => {
//         var params = {
//             Destination: {
//                 ToAddresses: [user.recipientEmail]
//             },
//             Message: {
//                 Body: {
//                     Html: {
//                         Charset: "UTF-8",
//                         Data: `<html lang="en-US">

//                         <head>
//                             <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
//                             <title>SquadCard</title>
//                             <meta name="description" content="SquadCard.">
//                             <style type="text/css">
//                                 a:hover {
//                                     text-decoration: underline !important;
//                                 }
//                             </style>
//                         </head>
                        
//                         <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
//                             <!--100% body table-->
//                             <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
//                                 style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
//                                 <tr>
//                                     <td>
//                                         <table style="background-color: #f2f3f8; max-width:700px;  margin:0 auto;" width="100%" border="0"
//                                             align="center" cellpadding="0" cellspacing="0">
//                                             <tr>
//                                                 <td style="height:80px;">&nbsp;</td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="text-align:center;">
//                                                     <h1
//                                                         style="color:#F43939; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
//                                                         SquadCard</h1>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="height:20px;">&nbsp;</td>
//                                             </tr>
//                                             <tr>
//                                                 <td>
//                                                     <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
//                                                         style="max-width:670px;background:#fff; border-radius:3px; -webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
//                                                         <tr>
//                                                             <td style="height:40px;">&nbsp;</td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td style="padding:0 35px;">
//                                                                 <h1
//                                                                     style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
//                                                                     SquadCard</h1>
//                                                                 <span
//                                                                     style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
//                                                                 <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
//                                                                     Hey ${user.recipientName},
//                                                                     <br>
//                                                                     <br>
//                                                                     Use this link to open SquadCard
//                                                                     <br>
//                                                                     This SquadCard has been sent by ${user.senderOrTeamName} - here it is!
//                                                                     <br>
//                                                                     <br>
//                                                                     <p style="text-align: center; width:100%;">
//                                                                     <a style="padding: 8px 15px; background-color: #09D1AA; list-style: none; color: #fff; text-decoration: none; border-radius: 5px;"
//                                                                         href=${user.url} title="logo" target="_blank">
//                                                                         Open SquadCard
// 															        </a>
//                                                                     </p>
//                                                                     <br>
//                                                                     If the above link doesn't work for you, here it is again - simply copy and paste it into your browser.
//                                                                     <br>
//                                                                     <strong>${user.url}</strong>
//                                                                     <br>
//                                                                     <br>
//                                                                     Enjoy!
//                                                                     <br>
//                                                                     <br>
//                                                                     Your friends at SquadCard
//                                                                 </p>
                        
//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td style="height:40px;">&nbsp;</td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             <tr>
//                                                 <td style="height:20px;">&nbsp;</td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="text-align:center;">
//                                                     <strong></strong></p>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="height:80px;">&nbsp;</td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>
//                             <!--/100% body table-->
//                         </body>
                        
//                         </html>
//                          `
//                     }
//                 },
//                 Subject: {
//                     Charset: "UTF-8",
//                     Data: "SquadCard"
//                 }
//             },
//             ReplyToAddresses: [config.AWS_REPLY_ADDRESS],
//             Source: config.AWS_MAIL,
//         };
//         await ses.sendEmail(params, function (err, data) {
//             if (err) {
//                 reject(err) // an error occurred
//             }
//             else {
//                 resolve(`Email has been sent to ${user.recipientEmail}, kindly follow the instructions`)
//             }      // successful response
//         });
//     })
// }

// export const admin_action_bulk_email = async (templateName: any, userArray: any, reason?: any, message?: any) => {
//     return new Promise(async (resolve, reject) => {
//         let destinationArray: any = []
//         await userArray.map(user => {
//             destinationArray.push({
//                 Destination: { ToAddresses: [user?.email] },
//                 ReplacementTemplateData: `{ \"fullName\":\"${user?.fullName}\", \"reason\":\"${reason}\", \"message\":\"${message}\"}`
//             })
//         })
//         var params = {
//             Destinations: destinationArray,
//             Source: config.AWS_MAIL,
//             Template: templateName,
//             DefaultTemplateData: '{ \"Mukund\":\"Mukund Khunt G.\" }',
//             ReplyToAddresses: [config.AWS_REPLY_ADDRESS]
//         };
//         await ses.sendBulkTemplatedEmail(params, function (err, data) {
//             if (err) {
//                 reject(err); // an error occurred
//             }
//             else {
//                 resolve(`Bulk email successfully sent`)
//             }      // successful response
//         });
//     })
// }

// export const admin_sent_all_user_mail = async (templateName: any, userArray: any, subject?: any, message?: any) => {
//     return new Promise(async (resolve, reject) => {
//         let destinationArray: any = []
//         await userArray.map(user => {
//             destinationArray.push({
//                 Destination: { ToAddresses: [user?.email] },
//                 ReplacementTemplateData: `{ \"subject\":\"${subject}\", \"message\":\"${message}\" }`
//             })
//         })
//         var params = {
//             Destinations: destinationArray,
//             Source: config.AWS_MAIL,
//             Template: templateName,
//             DefaultTemplateData: '{ \"Mukund\":\"Mukund Khunt G.\" }',
//             ReplyToAddresses: [config.AWS_REPLY_ADDRESS]
//         };
//         await ses.sendBulkTemplatedEmail(params, function (err, data) {
//             if (err) {
//                 reject(err); // an error occurred
//             }
//             else {
//                 resolve(`Bulk all user email successfully sent`)
//             }      // successful response
//         });
//     })
// }