export const AccessibilitySkipLink = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 bg-primary text-primary-foreground px-4 py-2 rounded-md 
                 font-medium z-50 transition-all focus:ring-2 focus:ring-ring"
    >
      Pular para o conteúdo principal
    </a>
  );
};