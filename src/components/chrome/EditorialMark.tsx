// The editorial mark (ADR-003, content-methodology §2): a quiet chip that
// says a claim is the site's own analysis rather than a sourced fact. It is
// a footnote's opposite: an editorial claim must NEVER carry a citation,
// because a footnote implies a source for a claim that has none. This
// component therefore renders no children and accepts no citation.
//
// The chip whispers. The claim system is explained once, on the colophon;
// in the prose the mark only needs to be findable, not loud.

import * as React from 'react'

export interface EditorialMarkProps {
  /** Override the default chip text where a section needs a sharper phrase. */
  label?: string
}

export const EditorialMark: React.FC<EditorialMarkProps> = ({ label = 'analysis' }) => (
  <span data-editorial-mark title="This is the site's own analysis — see the colophon">
    {label}
  </span>
)
