import createCache from '@emotion/cache';

// La clé 'css' indique à Emotion où injecter les styles.
// 'prepend: true' déplace les balises <style> d'Emotion au début du <head>,
// ce qui permet à vos styles personnalisés de les surcharger plus facilement.
export default function createEmotionCache() {
  return createCache({ key: 'css', prepend: true });
}
