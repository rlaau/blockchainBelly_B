function MyApp({ Component, pageProps }) {
    if (typeof window !== "undefined") {
      const noop = () => {};
      console.error = noop;
      console.warn = noop;
      console.log = noop;
    }
  
    return <Component {...pageProps} />;
  }
  
  export default MyApp;
  