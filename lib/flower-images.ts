import { ImageSourcePropType } from "react-native";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dpzb0itvs/";

export function flowerImage(imageUrl: string): ImageSourcePropType {
  const uri = imageUrl.startsWith("http") ? imageUrl : `${CLOUDINARY_BASE}${imageUrl}`;
  return { uri };
}
