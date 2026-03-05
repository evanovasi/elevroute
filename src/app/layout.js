import './globals.css';

export const metadata = {
  title: 'ElevRoute — Route & Elevation Finder',
  description: 'Temukan rute terbaik dengan profil elevasi, simulasi kendaraan, dan export data. Didukung Google Maps Platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <div className="app">
          {children}
        </div>
      </body>
    </html>
  );
}
