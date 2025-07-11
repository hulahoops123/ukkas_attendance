export function useEmail() {
  // EmailJS configuration
  const SERVICE_ID = 'service_yyzqiep'
  const TEMPLATE_ID = 'template_k48p3di' 
  const PUBLIC_KEY = 'ae8r1L_Oo_pWaOJTW'

  async function sendEmail(to_email, to_name, subject, message) {
    // Check if we have all required credentials
    if (PUBLIC_KEY === 'your_public_key') {
      console.warn('EmailJS public key not configured, falling back to mailto')
      const mailtoLink = `mailto:${to_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
      window.location.href = mailtoLink
      return { success: true, fallback: true }
    }

    try {
      // Try to import EmailJS
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

      console.log('Email sent successfully:', response)
      return { success: true, response }
    } catch (error) {
      console.error('Email send failed:', error)
      
      // Fallback to mailto if EmailJS fails
      const mailtoLink = `mailto:${to_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
      window.location.href = mailtoLink
      
      return { success: true, fallback: true }
    }
  }

  return {
    sendEmail
  }
}
