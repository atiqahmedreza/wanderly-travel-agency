/** Verified Pexels URLs — sea, forest, and green landscapes (always load) */
export const pexels = (id: number, w = 1920) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&dpr=1`;

export const HERO_IMAGES = [
  pexels(3225517), // ocean aerial
  pexels(1179229), // sunrise sea
  pexels(247599), // green forest
  pexels(3601425), // mountain valley
  pexels(912110), // turquoise water
  pexels(1586298), // tea plantation hills
];

export const ABOUT_HERO = pexels(457882, 1600);

export const DEFAULT_AVATAR = pexels(774909, 200);
