import Footer from '@/components/Footer';
import '@/styles/globals.css';
import localFont from 'next/font/local';
import { ClientLayout } from './ClientLayout';
import { DynamicLayoutProviders } from './(dynamic-pages)/DynamicLayoutProviders';

const inter = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const roboto_mono = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Photon - Multi-Agent Trading Dashboard',
  description: 'Multi-Agent Trading System Dashboard',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable} dark`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (!theme || theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <DynamicLayoutProviders>
          <div className="flex pt-2 flex-col min-h-screen bg-background">
            <ClientLayout>{children}</ClientLayout>
          </div>
        </DynamicLayoutProviders>
      </body>
    </html>
  );
}
