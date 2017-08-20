import nodemailer from 'nodemailer'
import ejs from 'ejs'
import juice from 'juice'
import htmlToText from 'html-to-text'
import promisify from 'es6-promisify'
import { readFileSync } from 'fs'
import { resolve } from 'path'
require('dotenv').config({ path: 'variables.env' })

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

const generateHTML = (filename, options = {}) => {
    const filepath = resolve(__dirname, '..', 'views', 'email', filename)
    const ejsTemplate = readFileSync(filepath, 'utf-8')
    const html = ejs.render(ejsTemplate, Object.assign({}, options, {filename: filepath}))
    return juice(html)
}

export async function send (options) {
    const html = generateHTML(options.filename, options)
    const text = htmlToText.fromString(html)

    const mailOptions = {
        from: `no-reply@dangthatsdelicious.com`,
        to: options.user.email,
        subject: options.subject,
        html,
        text
    }

    const sendMail = promisify(transport.sendMail, transport)

    return sendMail(mailOptions)
}