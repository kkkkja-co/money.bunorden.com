export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification')
    return false
  }

  if (!window.Notification || window.Notification.permission === 'granted') {
    return true
  }

  if (window.Notification.permission !== 'denied') {
    const permission = await window.Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export async function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window) || !window.Notification || window.Notification.permission !== 'granted') {
    return
  }

  try {
    // Try to send via Service Worker first (better for PWA)
    const registration = await navigator.serviceWorker.ready
    if (registration) {
      registration.showNotification(title, {
        icon: '/assets/icon-192.png',
        badge: '/assets/icon-192.png',
        ...options
      })
    } else if (window.Notification) {
      new window.Notification(title, options)
    }
  } catch (err) {
    if (window.Notification) {
      new window.Notification(title, options)
    }
  }
}
