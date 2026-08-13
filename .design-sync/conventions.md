## Setup

Wrap the app root in `next-themes`' `ThemeProvider` for `.dark` class toggling — components don't need any other provider. No context/theme wrapper is required to render styled: tokens are plain CSS custom properties on `:root`/`.dark`.

## Styling idiom: Tailwind v4 utility classes, semantic tokens only

Never hardcode hex or raw Tailwind palette colors (`bg-red-600`, `#8B1A1A`). Always use the semantic utility classes bound to CSS variables in `styles.css`:

`bg-background` `bg-foreground` `bg-card` `bg-card-foreground` `bg-popover` `bg-popover-foreground` `bg-primary` `bg-primary-foreground` `bg-secondary` `bg-secondary-foreground` `bg-muted` `bg-muted-foreground` `bg-accent` `bg-accent-foreground` `bg-destructive` `border-border` `border-input` `ring-ring`

Same family exists as `text-*` for foreground colors. Radius: `rounded-sm/md/lg/xl/2xl/3xl/4xl` map to `--radius` scale, not literal px. Dark mode is automatic — the same class picks up `.dark` token overrides, never write `dark:` variants for brand colors.

Headings use `font-heading` (Playfair Display), body text defaults to `font-body`/`font-sans` (DM Sans) — set via the `font-heading`/`font-body` utility classes, never inline `font-family`.

## Where the truth lives

- `styles.css` at bundle root — full compiled Tailwind output + all CSS custom properties (`:root`, `.dark`). Read this before styling anything; it is the token source of truth.
- `components/general/<Name>/<Name>.d.ts` — per-component prop contracts.

## Example

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "mitram-ui";
import { Button } from "mitram-ui";
import { Badge } from "mitram-ui";

<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="font-heading">Trip to Manali</CardTitle>
  </CardHeader>
  <CardContent className="flex items-center gap-2">
    <Badge className="bg-accent text-accent-foreground">Live tracking</Badge>
    <Button className="bg-primary text-primary-foreground">Book now</Button>
  </CardContent>
</Card>
```
