#!/usr/bin/env python3
"""MiniMax Image Generation Script"""

import urllib.request
import urllib.error
import json
import sys
import base64
import os
from pathlib import Path

API_KEY = "sk-cp-LAFqJ8zoM0LEHwXy4-7T1Fe-OMI-j-5y4IUFhAi_48AJdCE-ttvdzS0rQoDwkzjjJh1DUwz5PBci3Opntg3jRBw05LINQaVAInpiWDzkFfyLtjYDXPLtC98"
API_URL = "https://api.minimax.io/v1/image_generation"

def generate_image(prompt: str, output_path: str = "generated_image.png", model: str = "image-01"):
    """Generate image from text prompt using MiniMax API"""
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "prompt": prompt
    }
    
    print(f"Generating image with prompt: {prompt}")
    
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"Error: HTTP {e.code}")
        print(e.read().decode('utf-8'))
        return False
    
    print(f"Full response: {json.dumps(result, indent=2)}")
    
    if "data" in result:
        data = result["data"]
        
        image_url = None
        if isinstance(data, dict):
            if "image_urls" in data and len(data["image_urls"]) > 0:
                image_url = data["image_urls"][0]
            elif "image_url" in data:
                image_url = data["image_url"]
            elif "b64_image" in data:
                image_base64 = data["b64_image"]
                image_data = base64.b64decode(image_base64)
                with open(output_path, "wb") as f:
                    f.write(image_data)
                print(f"Image saved to: {output_path}")
                return True
        
        if image_url:
            print(f"Downloading image from: {image_url}")
            try:
                img_req = urllib.request.Request(image_url, headers={"User-Agent": "Mozilla/5.0"}, method='GET')
                with urllib.request.urlopen(img_req, timeout=60) as img_response:
                    image_data = img_response.read()
                    with open(output_path, "wb") as f:
                        f.write(image_data)
                    print(f"Image saved to: {output_path}")
                    return True
            except Exception as e:
                print(f"Failed to download image: {e}")
                return False
    
    print(f"Unexpected response structure")
    return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python minimax_image.py <prompt> [output_path]")
        sys.exit(1)
    
    prompt = sys.argv[1]
    output = sys.argv[2] if len(sys.argv) > 2 else "generated_image.png"
    
    success = generate_image(prompt, output)
    sys.exit(0 if success else 1)
