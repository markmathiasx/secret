import type { Metadata } from "next";
import { PinballStar } from "@/components/games/PinballStar";

export const metadata: Metadata = {
  title: "Pinball Star — Arcade MDH 3D",
  description:
    "Jogue Pinball Star, um mini-game arcade em Canvas 2D com flippers, bumpers, targets, score, high score e visual neon.",
  alternates: {
    canonical: "/jogue",
  },
};

export default function JoguePage() {
  return <PinballStar />;
}
