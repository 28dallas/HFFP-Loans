import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'

export function ConfirmDialog({ open, onClose, onConfirm, confirmText, loading, title, description }) {
  const [value, setValue] = useState('')
  const matches = value.trim().toLowerCase() === confirmText?.trim().toLowerCase()

  function handleClose() {
    setValue('')
    onClose()
  }

  function handleConfirm() {
    if (!matches) return
    onConfirm()
    setValue('')
  }

  return (
    <Modal open={open} onClose={handleClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
          <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{description}</p>
        </div>
        <Input
          label={`Type "${confirmText}" to confirm`}
          placeholder={confirmText}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!matches}
            loading={loading}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}
