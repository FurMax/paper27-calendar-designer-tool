# V1.1 tracing-paper replacement — 2026-09-25

**Product Owner direction:** research the feasibility of a stylized 硫酸纸 paper choice; if feasible, replace the recently added 亚麻纸 option and make the result noticeably more paper-like.

Canson describes tracing paper as translucent with a satin feel and microfine, smooth surface ([90 gsm](https://en.canson.com/tracing-paper-90-gsm), [Artist Series](https://us.canson.com/artist-series-tracing)). A true see-through sheet needs content beneath it. This calendar's lower region is a solid user color, so the local renderer approximates the material with a cool translucent satin wash, smooth broad variation, and a restrained sheet edge. It avoids the woven fibers of linen and the repeated circular blotches rejected during visual review.

- Remove **亚麻纸** from the UI and current texture ID list; put **硫酸纸** (`vellum`) in its place. The total stays seven choices.
- Apply only in the lower calendar region, never over photo pixels. Preview and canvas export use the same generated tile. The sheet edge is mirrored in proof and output. Keep existing artwork geometry and print metadata.
- Vary the wash by background contrast: stronger on light colors and bounded on dark colors to protect white-date readability. User background remains the base color; texture is an intentional visible overlay.
- Old saved schema-version-1 months with retired `linen` normalize to `vellum` when validated, without mutating the input or dropping the project. No schema bump.

This change supersedes the previous 亚麻纸 option in `design/ui-ux-change-request-v1-1-retro-linen.md`. Product Owner visual/device and printer review remain open. No deployment.
