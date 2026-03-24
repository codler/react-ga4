declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const gtag = (...args: any[]): void => {
  if (typeof window !== "undefined") {
    if (typeof window.gtag === "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }

    window.gtag(...args);
  }
};

export default gtag;
