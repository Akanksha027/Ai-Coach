// pages/_document.jsx
import { Html, Head, Main, NextScript } from 'next/document';
import { Html as CustomHtml } from 'next/document'; // ❌ Don't do this in other files!

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
