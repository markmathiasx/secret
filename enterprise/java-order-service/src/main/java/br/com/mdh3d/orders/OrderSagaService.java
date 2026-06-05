package br.com.mdh3d.orders;

import br.com.mdh3d.orders.dto.OrderCommand;
import br.com.mdh3d.orders.dto.OrderEvent;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class OrderSagaService {
  private final Map<String, OrderEvent> processedCommands = new ConcurrentHashMap<>();

  public OrderEvent handle(OrderCommand command) {
    return processedCommands.computeIfAbsent(command.idempotencyKey(), ignored -> nextEvent(command));
  }

  private OrderEvent nextEvent(OrderCommand command) {
    if (command.items().isEmpty()) {
      return new OrderEvent(command.orderId(), "ORDER_REJECTED", "empty_items", Instant.now());
    }
    if (command.totalPixCents() <= 0) {
      return new OrderEvent(command.orderId(), "ORDER_REJECTED", "invalid_total", Instant.now());
    }
    if (command.requiresHumanQuote()) {
      return new OrderEvent(command.orderId(), "QUOTE_REVIEW_REQUESTED", "custom_item_needs_review", Instant.now());
    }
    return new OrderEvent(command.orderId(), "ORDER_ACCEPTED", "ready_for_payment", Instant.now());
  }
}
