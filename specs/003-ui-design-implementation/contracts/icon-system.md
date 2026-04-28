# Contract: Icon System

## Component

`src/components/ui/Icon.tsx`

## Interface

```typescript
interface Props {
  name: string;       // filename without .svg extension, e.g. "calendar"
  size?: number;      // px, default 20
  className?: string; // Tailwind/CSS classes applied to <img>
  style?: React.CSSProperties;
}
```

## Behaviour

- Renders `<img src="/icons/{name}.svg" alt="" width={size} height={size} />`
- `alt` is always empty string — icons are decorative; labels live on the parent `aria-label`
- `style` is merged after `display: block` baseline

## Available icons

`activity` · `bolt` · `calendar` · `chart` · `check` · `chevron-down` · `chevron-left` · `chevron-right` · `dumbbell` · `moon` · `plus` · `settings` · `spark` · `trophy` · `x`

## Colour

Icons ship as black-stroke SVGs. To tint to white (e.g. check on green badge), apply:

```css
style={{ filter: 'brightness(0) invert(1)' }}
```

## Constraints

- No new icon may be added without placing the SVG in `public/icons/`
- Icon names must be lowercase kebab-case matching the filename
- Stroke weight: 1.75px, round caps, round joins, 24×24 viewBox (Lucide-compatible spec)
