import { ImageSourcePropType } from "react-native";

export function flowerImage(imageUrl: string): ImageSourcePropType {
  return { uri: imageUrl };
}
