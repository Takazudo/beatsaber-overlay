# URL Query Parameters

## Connection

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `ip` | string | `localhost` | Beat Saber mod server IP |

## Player Card

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `pid` | string | (none) | ScoreSaber player ID. Player card hidden if not set |

## Display Options

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `md` | boolean | `false` | Show miss counter |

## Positioning

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `scpos` | string | `bottom-left` | Song card position |
| `pcpos` | string | `top-right` | Player card position |

Valid positions: `top-left`, `top-right`, `bottom-left`, `bottom-right`

## Scaling

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `scsc` | number | `1.0` | Song card scale (0.1 - 2.0) |
| `pcsc` | number | `1.0` | Player card scale (0.1 - 2.0) |

## Style Tweaks (Extra Feature)

Custom CSS overrides via query parameters for streamer customization:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `bg` | string | (none) | Background color for cards (CSS color, hex without #) |
| `fg` | string | (none) | Text color (CSS color, hex without #) |
| `opacity` | number | `1.0` | Card opacity (0.0 - 1.0) |
| `radius` | number | (default) | Border radius in px |
| `css` | string | (none) | Raw CSS string to inject (URL-encoded) |

### Examples

```
?bg=000000&fg=ffffff&opacity=0.8
?radius=0&bg=1a1a2e
?css=.song-card{backdrop-filter:blur(10px)}
```

## Mock Mode

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `mock` | boolean | `false` | Enable mock mode for testing without Beat Saber |

When `?mock=true`, the overlay uses simulated data that cycles through gameplay states (menu -> playing -> paused -> finished) with realistic fake song/score data. No WebSocket connection needed.
