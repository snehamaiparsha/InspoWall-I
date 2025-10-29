import { IKImage } from "imagekitio-react";

const Image = ({ path, src, alt = "", className = "", w = 400, h = 400 }) => {
  const urlEndpoint = import.meta.env.VITE_URL_IK_ENDPOINT;

  // 🧠 Detect if given input is a full URL or just a path
  const isFullUrl = (str) => /^https?:\/\//.test(str);

  // Decide what to use
  const imageSrc = src || path || "";
  const useSrc = isFullUrl(imageSrc);
  const usePath = !useSrc;

  if (!imageSrc) return null; // no image → render nothing

  return (
    <IKImage
      urlEndpoint={urlEndpoint}
      {...(usePath ? { path: imageSrc } : { src: imageSrc })}
      transformation={[{ height: h, width: w }]}
      alt={alt}
      loading="lazy"
      className={className}
      lqip={{ active: true, quality: 20 }}
    />
  );
};

export default Image;
