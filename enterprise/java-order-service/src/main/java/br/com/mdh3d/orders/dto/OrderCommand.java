package br.com.mdh3d.orders.dto;

import java.util.List;

public record OrderCommand(
    String orderId,
    String idempotencyKey,
    List<String> items,
    long totalPixCents,
    boolean requiresHumanQuote
) {}
