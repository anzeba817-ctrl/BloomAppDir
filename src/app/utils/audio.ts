export const playSound = (soundFile: string, enabled: boolean) => {
  if (!enabled) return;

  try {
    const audio = new Audio(soundFile);
    // Le volume est réduit pour ne pas être trop intrusif
    audio.volume = 0.3;
    audio.play().catch(error => {
      // La lecture automatique peut être bloquée par le navigateur si l'utilisateur n'a pas encore interagi avec la page.
      console.error("La lecture du son a échoué:", error);
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'objet Audio:", error);
  }
};