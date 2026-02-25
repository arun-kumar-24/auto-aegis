import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "AutoAegis | Uptime & Flow Monitoring",
  description: "Stop guessing if your checkout works. Catch 'silent' bugs with AI-powered synthetic journeys.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased`}
        style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
      >
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a2e',
                color: '#e2e8f0',
                borderRadius: '1rem',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(168, 85, 247, 0.1)',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
