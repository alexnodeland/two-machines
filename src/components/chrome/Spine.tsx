// The spine (design-system §5, D-022): ONE page-level effect — a continuous
// line down the left margin, the tape, its brightness tracking the running
// instrument's feedback via --spine-heat. All behaviour is in tokens.css;
// this is only the element. Decorative, never load-bearing: aria-hidden, and
// at its floor it is nearly invisible but never broken-looking.

import * as React from 'react'

export const Spine: React.FC = () => <div data-spine aria-hidden="true" />
