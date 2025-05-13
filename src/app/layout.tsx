import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Ensure Toaster is imported for potential error messages

export const metadata: Metadata = {
  title: 'Thinking Quantum',
  description: 'An Apple-inspired Q&A system powered by AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster for displaying potential errors */}
      </body>
    </html>
  );
}
