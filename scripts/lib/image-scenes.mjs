/**
 * 카테고리별 이미지 장면 프롬프트
 * seed-backfill.mjs의 IMG_SCENES + IMG_PROMPT_SUFFIX 이관 및 확장
 */

export const IMG_PROMPT_SUFFIX = `35mm film grain, shot on Canon EOS R5 with 85mm f/1.4 lens, natural available light only, documentary style editorial photography, imperfect authentic details, no AI artifacts, no synthetic look`;

export const IMG_SCENES = {
  "꿈해몽": [
    "A person's silhouette sitting on a Korean apartment bed at 3am, blue moonlight through thin curtains, slightly messy blankets, a glass of water on the nightstand, Seoul city lights visible through window",
    "Close-up of a hand writing in a dream journal on a wooden Korean cafe table, warm afternoon light, coffee cup with condensation ring, pen slightly worn",
    "A narrow Seoul back alley at dawn, wet cobblestones after rain, a single street lamp creating long shadows, a stray cat sitting in the distance, slightly foggy atmosphere",
    "Korean bedroom at sunrise, person's feet under a rumpled blanket seen from the foot of the bed, warm golden light, alarm clock showing 6:47, slippers on the floor",
    "An old Korean fortune teller's table with tarot cards and a burning incense stick, moody warm lighting from a single desk lamp, worn wooden surface with tea stains",
    "A foggy Korean mountain path at early morning, stone steps disappearing into mist, moss on rocks, a single red hiking backpack left on a bench",
    "View through a rain-covered window of a Korean apartment, blurred city lights outside, a person's reflection barely visible, condensation droplets on glass",
    "A Korean traditional hanok courtyard at twilight, paper lanterns casting warm glow, shadow of a person on rice-paper door, still pond reflecting evening sky",
    "Close-up of a sleeping person's hand clutching bedsheets, soft blue predawn light, a half-open dream journal beside the pillow, crumpled tissues nearby",
    "A Korean subway platform at 2am, empty except for one person sitting on a bench staring at the tracks, harsh fluorescent light mixed with darkness",
    "An old Korean grandmother's room with a folding screen, dim oil lamp light, scattered divination sticks on a low table, embroidered cushions",
    "A misty lake at dawn in the Korean countryside, a single wooden rowboat tied to a pier, morning fog rolling over still water, birds silhouetted against pale sky",
  ],

  "생활정보": [
    "A Korean office worker's desk at 7pm, laptop half-closed, cold coffee in a paper cup, sticky notes on monitor, a coat draped over the chair, harsh fluorescent overhead light mixed with warm desk lamp",
    "A person's hands chopping vegetables on a wooden cutting board in a small Korean apartment kitchen, evening light, rice cooker steaming in background, slightly cluttered counter",
    "Running shoes placed neatly by a Korean apartment door at 5:30am, dawn light through the door crack, keys and earbuds on a small shelf, coat hooks with a jacket",
    "A Korean convenience store at night seen from outside, warm fluorescent glow, a person sitting alone at the window counter eating ramyeon, their reflection in the glass",
    "Close-up of hands holding a warm mug of tea on a Korean apartment balcony, winter morning, frost on the railing, dried laundry on a rack in background, breath visible in cold air",
    "A bookshelf in a Korean studio apartment with self-help books, a small succulent plant, reading glasses, warm desk lamp light, slightly dusty",
    "A Korean park bench in winter, person's back visible wearing a padded jacket, bare trees, a thermos and a book beside them, late afternoon golden hour light",
    "A Korean bathroom scale with bare feet stepping on, morning light through frosted window, toothbrush and face towel visible on counter, minimal clean aesthetic",
    "A person's hand reaching for an alarm clock on a Korean apartment nightstand, 5:30am, half-dark room, phone charging cable visible, water glass with condensation",
    "Korean apartment living room floor with a yoga mat rolled out, morning sunlight through blinds creating stripe patterns, a glass of water and phone timer visible",
    "A Korean outdoor market in morning, colorful fresh vegetables in wooden crates, an elderly vendor's weathered hands arranging produce, steam from a nearby food stall",
    "Close-up of a person's hand holding a smartwatch showing step count on a Korean riverside walking path, cherry blossoms in background, soft morning light",
  ],

  "운세/심리": [
    "A person's hand holding a smartphone showing a horoscope app in a Korean subway car, morning commute, other passengers blurred, natural daylight from windows",
    "Close-up of colorful tarot cards spread on a dark velvet cloth, candlelight, a person's hand hovering over the cards, rings on fingers, moody warm tones",
    "A mirror reflection in a Korean bathroom, steam from a hot shower, a person's blurred silhouette, toiletries on the shelf, morning light through frosted glass",
    "Two coffee cups on a Korean cafe table, one nearly empty one full, seen from above, rainy day light through window, a psychology book open between them",
    "A person sitting cross-legged on a Korean apartment floor with eyes closed, meditation pose, morning sunlight creating shadow patterns through blinds, minimal decor",
    "Close-up of a worn journal page with handwritten Korean text and small doodles, pen resting on the page, warm lamp light, wooden desk surface with coffee ring stains",
    "A Korean rooftop at twilight, city skyline in background, string lights overhead, a single chair and small table with a glass of wine, purple-orange sky gradient",
    "A traditional Korean tea ceremony setup, celadon teapot and cups on a bamboo mat, steam rising, soft afternoon light through rice-paper window, minimalist zen aesthetic",
    "Close-up of a person's eye with city lights reflected in the iris, shot through a rain-streaked window, neon signs blurred in background, cinematic blue-orange tones",
    "A Korean university campus at golden hour, a student sitting alone on library steps reading a psychology textbook, autumn leaves scattered, warm backlight",
    "A crystal ball on an antique Korean wooden desk, surrounded by old books and dried flowers, candlelight creating dramatic shadows, dust particles visible in light beam",
    "A person's hands shuffling a deck of oracle cards at a small Korean cafe, latte art visible nearby, afternoon light through lace curtains, intimate cozy atmosphere",
  ],
};

/**
 * 카테고리에 맞는 랜덤 장면 프롬프트 반환
 * @param {string} category
 * @returns {string}
 */
export function pickImageScene(category) {
  const scenes = IMG_SCENES[category];
  if (!scenes || scenes.length === 0) return "";
  const scene = scenes[Math.floor(Math.random() * scenes.length)];
  return `${scene}, ${IMG_PROMPT_SUFFIX}`;
}
