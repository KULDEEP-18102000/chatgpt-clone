import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChatGPT Clone',
  description: 'A pixel-perfect ChatGPT clone built with Next.js and Vercel AI SDK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: 'dark',
        variables: {
          colorPrimary: '#3b82f6',
          colorBackground: '#1f2937',
          colorInputBackground: '#374151',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: '#9ca3af',
          colorNeutral: '#374151',
          colorDanger: '#ef4444',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          fontFamily: '"Inter", sans-serif',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#2563eb',
              borderColor: '#2563eb',
            },
          },
          card: {
            backgroundColor: '#1f2937',
            borderColor: '#374151',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          },
          headerTitle: {
            color: '#ffffff',
            fontSize: '1.5rem',
            fontWeight: '600',
          },
          headerSubtitle: {
            color: '#9ca3af',
          },
          socialButtonsBlockButton: {
            backgroundColor: '#374151',
            borderColor: '#4b5563',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#4b5563',
            },
          },
          formFieldInput: {
            backgroundColor: '#374151',
            borderColor: '#4b5563',
            color: '#ffffff',
            '&::placeholder': {
              color: '#9ca3af',
            },
            '&:focus': {
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 1px #3b82f6',
            },
          },
          formFieldLabel: {
            color: '#d1d5db',
          },
          footerActionLink: {
            color: '#60a5fa',
            '&:hover': {
              color: '#93c5fd',
            },
          },
          dividerLine: {
            backgroundColor: '#374151',
          },
          dividerText: {
            color: '#9ca3af',
          },
          formHeaderTitle: {
            color: '#ffffff',
          },
          formHeaderSubtitle: {
            color: '#9ca3af',
          },
          socialButtonsBlockButtonText: {
            color: '#ffffff',
          },
          formFieldSuccessText: {
            color: '#10b981',
          },
          formFieldErrorText: {
            color: '#ef4444',
          },
          identityPreviewText: {
            color: '#d1d5db',
          },
          identityPreviewEditButton: {
            color: '#60a5fa',
          },
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-gray-900 text-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}