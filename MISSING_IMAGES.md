# Missing Menu Images

These menu items currently render the lettered placeholder card because no
photo exists yet. Drop each photo into `public/images/` using the exact
filename below (PNG, landscape, ideally ≥ 1200×675 to match the 16:9 cards)
and it will appear automatically on the next deploy — no code changes needed.
The menu data already points at these paths; a build-time check hides the
image slot until the file exists.

| Menu item                | Section         | Expected file                                    |
| ------------------------ | --------------- | ------------------------------------------------ |
| Teriyaki Chicken         | Chicken         | `public/images/teriyaki-chicken.png`             |
| Fresh Fish Fillet        | Seafood         | `public/images/fresh-fish-fillet.png`            |
| Spicy Squid              | Seafood         | `public/images/spicy-squid.png`                  |
| Fishcake                 | Banchan & Sides | `public/images/fishcake.png`                     |
| Lamb                     | Premium         | `public/images/lamb.png`                         |
| Marinated Pork Belly     | Premium         | `public/images/marinated-pork-belly.png`         |
| Beef Skirt Steak         | Premium         | `public/images/beef-skirt-steak.png`             |
| Popcorn Chicken          | Premium         | `public/images/popcorn-chicken.png`              |
| Prime Cut Steak          | Signature       | `public/images/prime-cut-steak.png`              |
| Beef Roll                | Signature       | `public/images/beef-roll.png`                    |
| Sliced Beef Short Plate  | Signature       | `public/images/sliced-beef-short-plate.png`      |
| Lamb Chop                | Signature       | `public/images/lamb-chop.png`                    |
| Miso Garlic Jumbo Shrimp | Signature       | `public/images/miso-garlic-jumbo-shrimp.png`     |

Naming convention: lowercase, hyphen-separated, `.png` — e.g.
"Butter Garlic Jumbo Shrimp" → `butter-garlic-jumbo-shrimp.png`.

All other menu, gallery, and homepage images are present as of 2026-07-01.
