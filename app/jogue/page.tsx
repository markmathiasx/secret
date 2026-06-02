import type { Metadata } from "next";
import { ArcadeHub } from "@/components/games/ArcadeHub";

export const metadata: Metadata = {
  title: "Arcade MDH 3D — Pinball Star e mini-games",
  description:
    "Jogue Pinball Star e mini-games originais da MDH 3D com runner, puzzle, gestão, entrega e desafios de impressão 3D.",
  alternates: {
    canonical: "/jogue",
  },
};

export default function JoguePage() {
  return <ArcadeHub />;
}
