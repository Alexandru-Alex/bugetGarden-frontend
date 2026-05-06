import { ImageSourcePropType } from "react-native";

const FLOWER_IMAGES: Record<string, ImageSourcePropType> = {
  "rose_v2.png":     require("../flowers/rose_v2.png"),
  "rose_v3.png":     require("../flowers/rose_v3.png"),
  "Tulip.png":       require("../flowers/Tulip.png"),
  "Lavender.png":    require("../flowers/Lavender.png"),
  "peony.png":       require("../flowers/peony.png"),
  "bluebell_v3.png": require("../flowers/bluebell_v3.png"),
  "marigold.png":    require("../flowers/marigold.png"),
  "daisy.png":       require("../flowers/daisy.png"),
  "Cosmos.png":      require("../flowers/Cosmos.png"),
  "hibiscus.png":    require("../flowers/hibiscus.png"),
  "Poppy_v2.png":    require("../flowers/Poppy_v2.png"),
  "Daffodil.png":    require("../flowers/Daffodil.png"),
};

export function flowerImage(imageUrl: string): ImageSourcePropType {
  return FLOWER_IMAGES[imageUrl] ?? FLOWER_IMAGES["daisy.png"];
}
