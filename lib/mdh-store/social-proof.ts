import "server-only";

import fs from "node:fs";
import path from "node:path";

export type LocalReview = {
  productSlug: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  photo?: string;
  verified: boolean;
  createdAt: string;
};

export type LocalQuestion = {
  productSlug: string;
  question: string;
  answer: string;
};

function readJson<T>(fileName: string, fallback: T): T {
  const filePath = path.join(process.cwd(), "data", fileName);
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function getLocalReviews(productSlug?: string) {
  const reviews = readJson<LocalReview[]>("mdh-store-reviews.json", []);
  const normalized = reviews.filter((review) => review.rating >= 1 && review.rating <= 5);
  return productSlug ? normalized.filter((review) => review.productSlug === productSlug) : normalized;
}

export function getLocalQuestions(productSlug?: string) {
  const questions = readJson<LocalQuestion[]>("mdh-store-questions.json", []);
  return productSlug ? questions.filter((question) => question.productSlug === productSlug) : questions;
}

export function getReviewSummary(productSlug: string) {
  const reviews = getLocalReviews(productSlug);
  if (!reviews.length) return { total: 0, average: null as number | null };
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return { total: reviews.length, average: Math.round(average * 10) / 10 };
}
