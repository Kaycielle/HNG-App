import { Icon } from './Icon'

type StorageNoticeProps = {
  message: string | null
  onDismiss: () => void
}

/** A warning banner shown when saved data couldn't be loaded or saved. */
export function StorageNotice({ message, onDismiss }: StorageNoticeProps) {
  if (!message) return null
  return (
    <div className="notice notice-warning storage-notice" role="alert">
      <span>{message}</span>
      <button type="button" className="icon-btn" aria-label="Dismiss warning" onClick={onDismiss}>
        <Icon name="close" size={16} />
      </button>
    </div>
  )
}
