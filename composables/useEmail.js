export function useEmail() {
  // EmailJS configuration - you'll need to set these up in your EmailJS account
  const SERVICE_ID = 'your_service_id'
  const TEMPLATE_ID = 'your_template_id' 
  const PUBLIC_KEY = 'your_public_key'

  async function sendEmail(to_email, to_name, subject, message) {
    try {
      const { default: emailjs } = await import('@emailjs/browser')
      
      const templateParams = {
        to_email,
        to_name,
        subject,
        message,
        from_name: 'Attendance System'
      }

      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      )

      return { success: true, response }
    } catch (error) {
      console.error('Email send failed:', error)
      return { success: false, error }
    }
  }

  return {
    sendEmail
  }
}
