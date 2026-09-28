# Header

Renders the site header from the `nav` document (`/nav`).

## Authoring the nav document

Sections, in order:

1. **Announcement** – one paragraph of text.
2. **Brand** – one paragraph with the home link (text wordmark).
3. **Tools** – a list of icon links (image + label). A link to `/search` becomes the search box.
4. **Menu** – optional heading (shown above the mobile category grid), then a nested list:
   - top-level item: link; add a nested list of **tabs** to give it a megamenu
   - tab: link, then a nested list of items (image + text link), then optional paragraphs:
     an "Explore" link, a banner image link, and a banner caption
   - tab layout is set by the tab label's formatting:
     - **bold** label → large image cards
     - *italic* label → icon + text
     - plain label → image cards (or text links when items have no images)
5. **Account** – heading, a "Sign in" link paragraph and a list of account links (mobile drawer).

Images must be regular document images (PNG/JPG), not SVG.
