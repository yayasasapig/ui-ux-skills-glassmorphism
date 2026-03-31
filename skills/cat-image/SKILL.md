---
name: cat-image
description: "Generate cute cartoon cat illustrations in a whimsical children's picture book style. Trigger: user says 貓貓圖 followed by the subject/scene to draw. The style is fixed: whimsical hand-drawn illustration, children's picture book aesthetic, soft pastel and muted color palette, warm off-white background, flat shapes with slightly uneven lines, playful cozy friendly mood, cute cartoon cats, round chubby proportions, big simple eyes, naive expressions, gentle innocent feeling, clean layout, lots of breathing space, minimal shading, calm and approachable."
---

# Cat Image Skill

Generate cute cartoon cat illustrations in a consistent children's picture book style.

## Trigger Pattern

User says: `貓貓圖` followed by the subject/scene

Example: `貓貓圖在公園追老鼠` → subject = "在公園追老鼠"

## Style Template

Always prepend this style description before the user's content:

```
whimsical hand-drawn illustration style, children's picture book aesthetic, soft pastel and muted color palette, warm off-white background, flat shapes with slightly uneven lines, playful, cozy, and friendly mood, cute cartoon cats as a recurring visual motif, round and chubby proportions, big simple eyes, naive expressions, gentle and innocent feeling, clean layout, lots of breathing space, minimal shading, calm and approachable tone
```

## Final Prompt Format

```
{style_template}, {user_content}
```

## Image Generation

1. Extract the user's content (after 貓貓圖)
2. Construct full prompt by combining style + content
3. Run: `python3 /Users/sacompig/.openclaw/workspace/skills/cat-image/scripts/minimax_image.py "{full_prompt}" cat_output.png`
4. Send result to user via Telegram

## Output

Send generated image back to user via Telegram.
