"""Catalog recommendation prototype with optional scikit-learn."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from typing import Iterable


@dataclass
class CatalogItem:
    id: str
    name: str
    category: str
    price_pix: float
    tags: list[str]


@dataclass
class Recommendation:
    id: str
    name: str
    score: float
    reason: str


def tokenize(value: str) -> set[str]:
    return {part.lower() for part in value.replace("/", " ").replace("-", " ").split() if len(part) > 2}


def local_recommend(query: str, items: Iterable[CatalogItem], limit: int = 6) -> list[Recommendation]:
    query_terms = tokenize(query)
    scored: list[Recommendation] = []
    for item in items:
        text = " ".join([item.name, item.category, *item.tags])
        overlap = query_terms.intersection(tokenize(text))
        price_bonus = max(0.0, 50.0 - item.price_pix) / 50.0
        score = len(overlap) + price_bonus
        if score > 0:
            scored.append(Recommendation(item.id, item.name, round(score, 4), "tag_price_similarity"))
    return sorted(scored, key=lambda item: item.score, reverse=True)[:limit]


def recommend(query: str, items: list[CatalogItem], limit: int = 6) -> list[Recommendation]:
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
        from sklearn.metrics.pairwise import cosine_similarity  # type: ignore

        corpus = [" ".join([item.name, item.category, *item.tags]) for item in items]
        matrix = TfidfVectorizer().fit_transform([query, *corpus])
        similarities = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
        ranked = sorted(enumerate(similarities), key=lambda pair: pair[1], reverse=True)[:limit]
        return [
            Recommendation(items[index].id, items[index].name, round(float(score), 4), "tfidf_similarity")
            for index, score in ranked
            if score > 0
        ]
    except Exception:
        return local_recommend(query, items, limit)


if __name__ == "__main__":
    demo_items = [
        CatalogItem("mdh-016", "Chaveiro Personalizado", "Chaveiros", 4.5, ["presente", "nome"]),
        CatalogItem("mdh-015", "Suporte para Celular", "Setup", 15.9, ["mesa", "utilidade"]),
    ]
    print(json.dumps([asdict(item) for item in recommend("presente barato", demo_items)], ensure_ascii=False))
