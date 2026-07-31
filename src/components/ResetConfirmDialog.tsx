interface Props {
  onConfirm: () => void
  onCancel: () => void
}

export function ResetConfirmDialog({ onConfirm, onCancel }: Props) {
  return (
    <div className="dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span id="reset-dialog-title" className="dialog__title">
          Event wirklich zurücksetzen?
        </span>
        <span className="dialog__body">
          Timer, Distanz und Rundenzähler werden auf den Startwert zurückgesetzt. Dies kann nicht
          rückgängig gemacht werden.
        </span>
        <div className="dialog__actions">
          <button type="button" className="btn" onClick={onCancel} autoFocus>
            Abbrechen
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>
            Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  )
}
