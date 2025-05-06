import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body className="antialiased overscroll-none min-h-[calc(100vh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
