from pathlib import Path
from PIL import Image, ImageDraw
import math

ROOT = Path(__file__).resolve().parents[1] / "public"

def star_points(cx, cy, outer, inner):
    points = []
    for index in range(10):
        radius = outer if index % 2 == 0 else inner
        angle = -math.pi / 2 + index * math.pi / 5
        points.append((cx + math.cos(angle) * radius, cy + math.sin(angle) * radius))
    return points

for size in (192, 512):
    scale = size / 512
    image = Image.new("RGBA", (size, size), "#dff4df")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((56*scale, 56*scale, 456*scale, 456*scale), radius=76*scale, fill="#75c9b0")
    draw.rectangle((88*scale, 330*scale, 424*scale, 404*scale), fill="#43845c")
    draw.rectangle((120*scale, 404*scale, 392*scale, 452*scale), fill="#76543d")
    points = [(x*scale, y*scale) for x, y in star_points(256, 221, 174, 83)]
    draw.polygon(points, fill="#ffd95c", outline="#fff5c4", width=max(2, int(13*scale)))
    draw.rectangle((224*scale, 188*scale, 248*scale, 218*scale), fill="#4c503e")
    draw.rectangle((280*scale, 188*scale, 304*scale, 218*scale), fill="#4c503e")
    draw.rectangle((224*scale, 252*scale, 304*scale, 272*scale), fill="#e89b43")
    image.save(ROOT / f"icon-{size}.png", optimize=True)
