import '@fontsource-variable/archivo/wdth.css';
import './globals.css';

export const metadata = {
  title: 'Moodboard',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
