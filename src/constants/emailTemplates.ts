export const EMAIL_TEMPLATES = {
  "instant-response": {
    id: "instant-response",
    name: "Instant Response - New Lead",
    subject: "Thanks for your interest, {{contact_name}}!",
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Interest!</h1>
        </div>
        
        <div style="padding: 30px 20px; background: #ffffff;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi {{contact_name}},</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thank you for showing interest in our services! We're excited to help {{company_name}} achieve its goals.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            I've received your information and will be reaching out within the next few minutes to discuss how we can help you:
          </p>
          
          <ul style="font-size: 16px; line-height: 1.8; color: #333; padding-left: 20px;">
            <li>Increase your revenue by 10x</li>
            <li>Automate your business processes</li>
            <li>Scale without hiring additional staff</li>
            <li>Get real-time insights and analytics</li>
          </ul>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>What happens next?</strong><br>
              1. I'll call you within 5 minutes<br>
              2. We'll discuss your specific needs<br>
              3. I'll create a custom solution for you
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            If you have any immediate questions, feel free to reply to this email or call me directly at <strong>{{agent_phone}}</strong>.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Best regards,<br>
            <strong>{{agent_name}}</strong><br>
            {{agent_title}}<br>
            {{company_name}}
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            This email was sent because you expressed interest in our services.
          </p>
        </div>
      </div>
    `,
    text_content: `Hi {{contact_name}},

Thank you for showing interest in our services! We're excited to help {{company_name}} achieve its goals.

I've received your information and will be reaching out within the next few minutes to discuss how we can help you:

• Increase your revenue by 10x
• Automate your business processes  
• Scale without hiring additional staff
• Get real-time insights and analytics

What happens next?
1. I'll call you within 5 minutes
2. We'll discuss your specific needs
3. I'll create a custom solution for you

If you have any immediate questions, feel free to reply to this email or call me directly at {{agent_phone}}.

Best regards,
{{agent_name}}
{{agent_title}}
{{company_name}}`,
    variables: ["contact_name", "company_name", "agent_name", "agent_title", "agent_phone"],
    category: "lead_response",
    is_active: true,
  },

  "follow-up-sequence-1": {
    id: "follow-up-sequence-1",
    name: "Follow-up Sequence - Day 1",
    subject: "Quick question about {{company_name}}'s growth goals",
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 30px 20px; background: #ffffff;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi {{contact_name}},</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            I tried reaching you earlier but wanted to follow up with a quick question.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            What's the biggest challenge {{company_name}} is facing right now when it comes to growth?
          </p>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <p style="margin: 0; font-size: 16px; color: #333;">
              <strong>Common challenges we solve:</strong><br>
              • Lead generation and conversion<br>
              • Sales process automation<br>
              • Customer retention and engagement<br>
              • Scaling operations efficiently
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            I'd love to share how we've helped similar companies in {{industry}} overcome these exact challenges.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{calendar_link}}" style="background: #2196f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Book a 15-Minute Call
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Best regards,<br>
            <strong>{{agent_name}}</strong>
          </p>
        </div>
      </div>
    `,
    text_content: `Hi {{contact_name}},

I tried reaching you earlier but wanted to follow up with a quick question.

What's the biggest challenge {{company_name}} is facing right now when it comes to growth?

Common challenges we solve:
• Lead generation and conversion
• Sales process automation  
• Customer retention and engagement
• Scaling operations efficiently

I'd love to share how we've helped similar companies in {{industry}} overcome these exact challenges.

Book a 15-minute call: {{calendar_link}}

Best regards,
{{agent_name}}`,
    variables: ["contact_name", "company_name", "industry", "agent_name", "calendar_link"],
    category: "follow_up",
    is_active: true,
  },

  "webinar-confirmation": {
    id: "webinar-confirmation",
    name: "Webinar Registration Confirmation",
    subject: "You're registered! Here's what to expect...",
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">You're All Set!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Registration Confirmed</p>
        </div>
        
        <div style="padding: 30px 20px; background: #ffffff;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi {{contact_name}},</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Great news! You're officially registered for our exclusive masterclass:
          </p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">{{webinar_title}}</h3>
            <p style="margin: 0; font-size: 16px; color: #856404;">
              <strong>Date:</strong> {{webinar_date}}<br>
              <strong>Time:</strong> {{webinar_time}}<br>
              <strong>Duration:</strong> 60 minutes
            </p>
          </div>
          
          <h3 style="color: #333; margin: 30px 0 15px 0;">What You'll Learn:</h3>
          <ul style="font-size: 16px; line-height: 1.8; color: #333; padding-left: 20px;">
            <li>The 3 proven strategies for 10x growth</li>
            <li>How to automate your sales process</li>
            <li>Case studies from successful companies</li>
            <li>Live Q&A with industry experts</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{webinar_link}}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Add to Calendar
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Pro Tip:</strong> Join 5 minutes early to test your connection and grab the best virtual seat!
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            See you there!<br>
            <strong>{{host_name}}</strong>
          </p>
        </div>
      </div>
    `,
    text_content: `Hi {{contact_name}},

Great news! You're officially registered for our exclusive masterclass:

{{webinar_title}}
Date: {{webinar_date}}
Time: {{webinar_time}}
Duration: 60 minutes

What You'll Learn:
• The 3 proven strategies for 10x growth
• How to automate your sales process
• Case studies from successful companies
• Live Q&A with industry experts

Add to calendar: {{webinar_link}}

Pro Tip: Join 5 minutes early to test your connection and grab the best virtual seat!

See you there!
{{host_name}}`,
    variables: ["contact_name", "webinar_title", "webinar_date", "webinar_time", "webinar_link", "host_name"],
    category: "webinar",
    is_active: true,
  },

  "consultation-booking": {
    id: "consultation-booking",
    name: "Consultation Booking Confirmation",
    subject: "Your consultation is confirmed - {{consultation_date}}",
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Consultation Confirmed!</h1>
        </div>
        
        <div style="padding: 30px 20px; background: #ffffff;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi {{contact_name}},</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Perfect! Your strategy consultation is confirmed. I'm looking forward to discussing how we can help {{company_name}} achieve its growth goals.
          </p>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6c3;">
            <h3 style="margin: 0 0 15px 0; color: #2d5a2d;">Consultation Details</h3>
            <p style="margin: 0; font-size: 16px; color: #2d5a2d;">
              <strong>Date:</strong> {{consultation_date}}<br>
              <strong>Time:</strong> {{consultation_time}}<br>
              <strong>Duration:</strong> 30 minutes<br>
              <strong>Meeting Link:</strong> <a href="{{meeting_link}}" style="color: #2d5a2d;">{{meeting_link}}</a>
            </p>
          </div>
          
          <h3 style="color: #333; margin: 30px 0 15px 0;">What We'll Cover:</h3>
          <ul style="font-size: 16px; line-height: 1.8; color: #333; padding-left: 20px;">
            <li>Your current business challenges and goals</li>
            <li>Opportunities for growth and optimization</li>
            <li>Custom strategy recommendations</li>
            <li>Next steps for implementation</li>
          </ul>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">To Prepare for Our Call:</h4>
            <ul style="margin: 0; font-size: 14px; color: #856404; padding-left: 20px;">
              <li>Think about your biggest business challenges</li>
              <li>Have your current metrics ready (if available)</li>
              <li>Consider your growth goals for the next 12 months</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            If you need to reschedule, please let me know at least 24 hours in advance.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Looking forward to our conversation!<br>
            <strong>{{consultant_name}}</strong><br>
            {{consultant_title}}<br>
            {{consultant_phone}}
          </p>
        </div>
      </div>
    `,
    text_content: `Hi {{contact_name}},

Perfect! Your strategy consultation is confirmed. I'm looking forward to discussing how we can help {{company_name}} achieve its growth goals.

Consultation Details:
Date: {{consultation_date}}
Time: {{consultation_time}}
Duration: 30 minutes
Meeting Link: {{meeting_link}}

What We'll Cover:
• Your current business challenges and goals
• Opportunities for growth and optimization
• Custom strategy recommendations
• Next steps for implementation

To Prepare for Our Call:
• Think about your biggest business challenges
• Have your current metrics ready (if available)
• Consider your growth goals for the next 12 months

If you need to reschedule, please let me know at least 24 hours in advance.

Looking forward to our conversation!
{{consultant_name}}
{{consultant_title}}
{{consultant_phone}}`,
    variables: [
      "contact_name",
      "company_name",
      "consultation_date",
      "consultation_time",
      "meeting_link",
      "consultant_name",
      "consultant_title",
      "consultant_phone",
    ],
    category: "consultation",
    is_active: true,
  },
}

export function getEmailTemplate(templateId: string) {
  return EMAIL_TEMPLATES[templateId as keyof typeof EMAIL_TEMPLATES] || null
}

export function getAllEmailTemplates() {
  return Object.values(EMAIL_TEMPLATES)
}

export function getEmailTemplatesByCategory(category: string) {
  return Object.values(EMAIL_TEMPLATES).filter((template) => template.category === category)
}

export function renderEmailTemplate(templateId: string, variables: Record<string, string>) {
  const template = getEmailTemplate(templateId)
  if (!template) return null

  let htmlContent = template.html_content
  let textContent = template.text_content
  let subject = template.subject

  // Replace variables in all content
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    htmlContent = htmlContent.replace(new RegExp(placeholder, "g"), value)
    textContent = textContent.replace(new RegExp(placeholder, "g"), value)
    subject = subject.replace(new RegExp(placeholder, "g"), value)
  })

  return {
    ...template,
    subject,
    html_content: htmlContent,
    text_content: textContent,
  }
}
