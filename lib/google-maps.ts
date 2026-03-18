declare global {
  interface Window {
    google?: any;
  }
}

let loader: Promise<boolean> | null = null;

export function loadGoogleMapsPlaces(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.google?.maps?.places) return Promise.resolve(true);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.resolve(false);

  if (loader) return loader;

  loader = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=pt-BR`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(Boolean(window.google?.maps?.places));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return loader;
}
