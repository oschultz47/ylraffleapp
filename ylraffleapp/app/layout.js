import './globals.css';
import { AuthProvider } from './context/AuthContext';

export const metadata = {
  title: 'BVYL Raffle',
  description: 'Welcome to the BVYL Raffle application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
