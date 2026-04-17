/**
 * Inline script that runs BEFORE React hydration to set the `dark` class
 * based on localStorage or system preference. Prevents FOUC.
 */
export function ThemeScript() {
  const code = `
    try {
      var saved = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = saved || (prefersDark ? 'dark' : 'light');
      if (theme === 'dark') document.documentElement.classList.add('dark');
    } catch (_) {}
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
