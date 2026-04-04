import { useState } from "react"

const HINTS = [
  "help",
  "select provider parentA",
  "select key ak_001",
  "clear"
]

export default function CommandBar({onCommand}) {
  const [value, setValue] = useState("")
const [hint] = useState(HINTS[0])

  function handleKey(e) {
    if (e.key === "Enter" && value.trim()) {
      onCommand?.(value.trim())
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
