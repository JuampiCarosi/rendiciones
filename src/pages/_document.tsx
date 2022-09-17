import { Html, Head, Main, NextScript } from "next/document";

const MyDocument = () => {
  return (
    <Html className="h-full">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=optional" rel="stylesheet" />
      </Head>
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default MyDocument;
