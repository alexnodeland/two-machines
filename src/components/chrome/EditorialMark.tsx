// The editorial mark (ADR-003, content-methodology §2): a visible chip that
// says a claim is the site's own analysis. It is not an apology — a guide
// honest about which claims are its own is more trustworthy, not less.
//
// The rule it enforces typographically: an editorial claim must NEVER carry
// a footnote, because a footnote implies a source for a claim that has none.
// This component therefore renders no children and accepts no citation.

import * as React from 'react'

export interface EditorialMarkProps {
  /** Override the default chip text where a section needs a sharper phrase. */
  label?: string
}

export const EditorialMark: React.FC<EditorialMarkProps> = ({
  label = 'Our framing, not Fripp’s',
}) => (
  <span
    data-editorial-mark
    style={{
      display: 'inline-block',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.72rem',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--ink-deep)',
      background: 'var(--brass)',
      borderRadius: '2px',
      padding: '0.1rem 0.45rem',
      verticalAlign: 'middle',
    }}
  >
    {label}
  </span>
)
