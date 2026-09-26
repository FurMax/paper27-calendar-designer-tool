# V1.1 Editor hierarchy and duotone follow-up

**Owner direction:** 2026-09-25. **Status:** implemented for Product Owner review; no deployment.

The Month Editor retains 01 EDIT → 02 FINE TUNE → 03 MARK. Crop, five photo-effect choices, and compact background recommendations/common colors remain visible. The precise picker, HEX and RGB stay behind a default-closed “精确调色” control that can remain open while changing months in the current Editor session.

Text Color moves from its standalone right-rail section to 02 FINE TUNE → 日历文字, after the existing four-font and three-scale controls. Auto stays the default. Custom color picker/HEX and the existing contrast warning remain conditional on Custom. FINE TUNE is open by default and MARK closed. Both can be opened independently and keep their open state during month changes in the mounted Editor. The closed MARK header shows the current month's marked-day count.

Duotone now has exactly six pairs at the Product Owner's specified RGB values: 深蓝 × 奶白 (#26364A/#F3EEE3), 酒红 × 浅粉 (#7E394F/#E8BCC8), 墨绿 × 米白 (#29483F/#EFE8DA), 雾蓝 × 冷白 (#607A9B/#EDF3F7), 蓝紫 × 浅紫灰 (#6E648C/#E8E2F0), 珊瑚 × 奶黄 (#C85F54/#F3E6B8). The earlier three pairs' values are superseded. One optional boolean on the existing per-month photo effect swaps dark/light endpoints. The visible pair label and swatch reverse with it. This is a true luminance-to-endpoint mapping with continuous intermediate tones; it is not a grayscale overlay. Editor, Review and PNG/JPG continue to call the same effect function.

No geometry, crop, assignment, typography option count, texture semantics, date data, export size or main page grid changed. Earlier documents specifying exactly three duotone pairs are historical.
