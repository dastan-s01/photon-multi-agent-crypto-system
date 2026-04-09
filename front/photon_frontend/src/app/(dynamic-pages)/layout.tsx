

export const metadata = {
  icons: {
    icon: '/images/logo-black-main.ico',
  },
  title: 'Photon',
  description: 'Photon',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
