/**
 * Vercel Serverless Function - SendGrid Email Handler
 * ====================================================
 * 
 * This function handles contact form submissions from the Element Landscaping
 * Waikato website and sends emails via SendGrid.
 * 
 * Environment Variables Required:
 * - SENDGRID_API_KEY: Your SendGrid API key
 * 
 * Endpoint: POST /api/sendQuote
 */

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    // Extract form data from request body
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'All fields are required' 
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Invalid email format' 
        });
    }

    // Check for SendGrid API key
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendgridApiKey) {
        console.error('SENDGRID_API_KEY environment variable is not set');
        return res.status(500).json({ 
            success: false, 
            error: 'Server configuration error' 
        });
    }

    // Build email content
    const emailSubject = `New Quote Request from ${name}`;
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a3c34; border-bottom: 2px solid #6b8f71; padding-bottom: 10px;">
                New Quote Request
            </h2>
            <p style="color: #2c2c2c; font-size: 16px;">
                You have received a new quote request from the Element Landscaping Waikato website.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 12px; background: #f5f2ec; font-weight: bold; width: 120px; color: #1a3c34;">Name:</td>
                    <td style="padding: 12px; background: #faf9f7;">${name}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; background: #f5f2ec; font-weight: bold; color: #1a3c34;">Email:</td>
                    <td style="padding: 12px; background: #faf9f7;">
                        <a href="mailto:${email}" style="color: #1a3c34;">${email}</a>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px; background: #f5f2ec; font-weight: bold; color: #1a3c34;">Phone:</td>
                    <td style="padding: 12px; background: #faf9f7;">
                        <a href="tel:${phone}" style="color: #1a3c34;">${phone}</a>
                    </td>
                </tr>
            </table>
            <div style="margin: 20px 0;">
                <h3 style="color: #1a3c34; margin-bottom: 10px;">Message:</h3>
                <div style="background: #faf9f7; padding: 15px; border-left: 4px solid #6b8f71; color: #2c2c2c;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            </div>
            <p style="color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #e8e4dc; padding-top: 15px;">
                This email was sent from the Element Landscaping Waikato website contact form.
            </p>
        </div>
    `;

    const emailText = `
New Quote Request from Element Landscaping Waikato Website

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

---
This email was sent from the Element Landscaping Waikato website contact form.
    `.trim();

    // SendGrid API payload
    const sendgridPayload = {
        personalizations: [
            {
                to: [
                    { email: 'elementlandscapenz@gmail.com' },
                    { email: 'elwquotes@gmail.com' }
                ],
                subject: emailSubject
            }
        ],
        from: {
            email: 'elwquotes@gmail.com',
            name: 'Element Landscaping Waikato'
        },
        reply_to: {
            email: email,
            name: name
        },
        content: [
            {
                type: 'text/plain',
                value: emailText
            },
            {
                type: 'text/html',
                value: emailHtml
            }
        ]
    };

    try {
        // Send email via SendGrid API
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sendgridApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sendgridPayload)
        });

        // SendGrid returns 202 for successful email queuing
        if (response.status === 202) {
            return res.status(200).json({ 
                success: true, 
                message: 'Email sent successfully' 
            });
        }

        // Handle SendGrid errors
        const errorData = await response.json().catch(() => ({}));
        console.error('SendGrid API Error:', response.status, errorData);
        
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to send email. Please try again later.' 
        });

    } catch (error) {
        console.error('SendGrid Request Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to send email. Please try again later.' 
        });
    }
}
