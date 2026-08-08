# Design notes

Agent-written. Holds only what the code cannot express.

**Rule: if it is visible in the code, it does not belong here.** No hex values, no font names, no
spacing numbers, no component structure — all of that is derivable and will go stale here.
Target: under 40 lines for the life of the project.

## Intent

<!-- the feeling words, from the first brief -->

## Rejected

<!-- directions tried and turned down, with the reason.
     Highest-value content in this file: rejections leave zero trace in code. -->

## Standing rules

<!-- preferences that emerged during review.
     "too tight" in a Lavish session becomes "generous vertical spacing" here. -->

## References used

<!-- which library slug drove which surface -->

## Environment

<!-- one-off findings worth not rediscovering: tooling quirks, a workaround that
     took a while to find, a constraint imposed from outside the repo.

     NOT a place to smuggle in what the code already says. "Fonts load from a CDN
     rather than local files" is a constraint. Naming the fonts is not — that is in
     the code and will go stale here. -->
