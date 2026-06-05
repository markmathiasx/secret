package br.com.mdh3d.orders.dto;

import java.time.Instant;

public record OrderEvent(
    String orderId,
    String type,
    String reason,
    Instant occurredAt
) {}
