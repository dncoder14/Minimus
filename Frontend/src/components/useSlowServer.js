import { useEffect, useRef, useState } from 'react'

// Free hosting cold-starts slowly: after 15s tell the user to wait, after 2 minutes say it is down.
export default function useSlowServer(loading) {
  const [message, setMessage] = useState(null)
  const timers = useRef([])

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    setMessage(null)
    if (loading) {
      timers.current = [setTimeout(() => setMessage('slow'), 15000), setTimeout(() => setMessage('timeout'), 120000)]
    }
    return () => timers.current.forEach(clearTimeout)
  }, [loading])

  return message
}
