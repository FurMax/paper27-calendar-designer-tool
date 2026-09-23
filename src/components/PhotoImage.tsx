import { useEffect, useState } from 'react';

export function PhotoImage({ blob, alt = '' }: { blob: Blob; alt?: string }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);
  return url ? <img className="photo-image" src={url} alt={alt} /> : null;
}
