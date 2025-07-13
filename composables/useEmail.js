export function useEmail() {
  // Load from environment variables
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  async function sendEmail(to_email, to_name, subject, message) {
    if (!PUBLIC_KEY) {
      console.warn('EmailJS public key not configured, falling back to mailto')
      const mailtoLink = `mailto:${to_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
      window.location.href = mailtoLink
      return { success: true, fallback: true }
    }

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

      console.log('Email sent successfully:', response)
      return { success: true, response }
    } catch (error) {
      console.error('Email send failed:', error)
      const mailtoLink = `mailto:${to_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
      window.location.href = mailtoLink
      return { success: true, fallback: true }
    }
  }

  return {
    sendEmail
  }
}
