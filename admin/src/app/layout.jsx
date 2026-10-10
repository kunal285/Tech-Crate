import './globals.css';

export const metadata = {
  title: 'Tech Crate — Admin Control Panel',
  description: 'Privileged control center for hardware e-commerce platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
