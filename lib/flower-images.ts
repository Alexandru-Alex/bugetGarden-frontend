import { ImageSourcePropType } from "react-native";

const FLOWER_IMAGES: Record<string, ImageSourcePropType> = {
  "rose_v2.png":     require("../flowers/rose_v2.png"),
  "rose_v3.png":     require("../flowers/rose_v3.png"),
  "Lavender.png":    require("../flowers/Lavender.png"),
  "peony.png":       require("../flowers/peony.png"),
  "bluebell_v3.png": require("../flowers/bluebell_v3.png"),
  "marigold.png":    require("../flowers/marigold.png"),
  "daisy.png":       require("../flowers/daisy.png"),
  "Cosmos.png":      require("../flowers/Cosmos.png"),
  "hibiscus.png":    require("../flowers/hibiscus.png"),
  "Poppy_v2.png":    require("../flowers/Poppy_v2.png"),
  "yellow_tulip.png":    require("../flowers/yellow_tulip.png"),
  "sunflower.png":    require("../flowers/sunflower.png"),
  "red_tulip.png":    require("../flowers/red_tulip.png"),
  "lily.png":         require("../flowers/lily.png"),
  "sacred_lotus.png":    require("../flowers/sacred_lotus.png"),
  "snapdragon.png":    require("../flowers/snapdragon.png"),
  "Duranta.png":       require("../flowers/duranta.png"),
  "Nigella.png":        require("../flowers/Nigella.png"),

};

export function flowerImage(imageUrl: string): ImageSourcePropType {
  return FLOWER_IMAGES[imageUrl] ?? FLOWER_IMAGES["daisy.png"];
}
