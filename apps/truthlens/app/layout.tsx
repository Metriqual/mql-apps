import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TruthLens — research assistant with a hallucination blocker',
  description:
    'Ask the same question twice: once raw, once through Metriqual’s hallucination blocker. See fabricated citations, fake statistics, and overconfident claims get caught in real time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
