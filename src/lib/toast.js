let toastContainer = null

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

export function showToast(message, type = 'success', duration = 3000) {
  const container = getToastContainer()

  const toast = document.createElement('div')
  const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
  const borderColor = type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#1d4ed8'

  toast.style.cssText = `
    background-color: ${bgColor};
    color: white;
    padding: 14px 20px;
    border-radius: 8px;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
    pointer-events: auto;
    cursor: default;
    border-left: 4px solid ${borderColor};
    max-width: 320px;
    word-wrap: break-word;
  `
  toast.textContent = message

  container.appendChild(toast)

  const timer = setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      container.removeChild(toast)
    }, 300)
  }, duration)

  toast.addEventListener('click', () => {
    clearTimeout(timer)
    toast.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast)
      }
    }, 300)
  })

  return () => clearTimeout(timer)
}

// Add animations to document if not already present
if (!document.getElementById('toast-animations')) {
  const style = document.createElement('style')
  style.id = 'toast-animations'
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}
