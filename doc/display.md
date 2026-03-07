# Display Components

## Song Card

Displays current song and gameplay data:

- Cover art image
- Song title, subtitle, artist, mapper
- BSR key (from BeatSaver API)
- Difficulty badge (color-coded: Easy/Normal/Hard/Expert/ExpertPlus)
- BPM
- Elapsed time / Total duration (MM:SS)
- Accuracy percentage with letter grade (SS/S/A/B/C/D/E)
- Score (formatted with commas)
- Combo count
- Miss counter (toggleable via `?md=true`)
- Health bar
- Speed modifier display (if not 1.0x)
- Ranked status and PP value

### Difficulty Colors

| Difficulty | Color |
|-----------|-------|
| Easy | #008055 |
| Normal | #1268a1 |
| Hard | #bd5500 |
| Expert | #b52a1c |
| ExpertPlus | #454088 |

### Accuracy Grades

| Range | Grade |
|-------|-------|
| >= 90% | SS |
| >= 80% | S |
| >= 65% | A |
| >= 50% | B |
| >= 35% | C |
| >= 20% | D |
| < 20% | E |

## Player Card

Displays ScoreSaber player info:

- Profile avatar
- Country flag
- World rank
- Country rank
- Performance Points (PP)

Fetched from ScoreSaber API using player ID (`?pid=` parameter).

## Visibility

- Song card shown only during gameplay (playing/paused states)
- Player card shown when on menu (no active song)
- Smooth transitions between states
