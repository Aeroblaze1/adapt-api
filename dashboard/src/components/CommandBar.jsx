import { useState } from "react"

const HINTS = [
  "type a command or press ↑↓ to navigate",
  "e.g.: select provider, filter keys…",
  "console ready",
]

export default function CommandBar() {
  const [value, setValue] = useState("")
  const [hint] = useState(HINTS[2])

  function handleKey(e) {
    if (e.key === "Enter" && value.trim()) {
      setValue("")
    }
    if (e.key === "Escape") {
      setValue("")
    }
  }

  return (
    <div className="command-bar">
      <span className="cb-prompt">❯</span>
      <input
        id="command-input"
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={hint}
        autoComplete="off"
        spellCheck={false}
      />
      <span className="cb-hint">ESC to clear</span>
    </div>
  )
}
