---
name: mini-image
description: "Generate images from text prompts using MiniMax Image-01 API. Use when user wants to create images (photo, illustration, art, etc.) via text-to-image. Triggers on: generate image, create image, draw a picture, text-to-image, 文生图, 画图, or any request to generate images from descriptions."
---

# Mini-Image Skill

Generate images using MiniMax Image-01 API via command line.

## Usage

Run the script with a prompt:

```bash
python3 /Users/sacompig/.openclaw/workspace/skills/mini-image/scripts/minimax_image.py "your prompt here" output.png
```

## Workflow

1. Receive user's image prompt (in any language)
2. Run the generation script
3. Send the generated image back to user via Telegram

## Example Prompts

- **寫實風格**: "A cat chasing mice in a kitchen, dramatic action shot, realistic photography style"
- **卡通/動漫風格**: "A cute cartoon cat playing with a ball of yarn, colorful, Disney style"
- **風景**: "A beautiful sunset over the ocean with palm trees, golden hour lighting"
- **人物**: "A portrait of a young woman reading a book, soft natural light, bokeh background"

## Output

Images are saved to the script's working directory. Send via Telegram using the `message` tool with `media` parameter.
