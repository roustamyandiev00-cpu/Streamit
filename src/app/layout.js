import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Streamit Dashboard',
  description: 'Pro Streaming Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
