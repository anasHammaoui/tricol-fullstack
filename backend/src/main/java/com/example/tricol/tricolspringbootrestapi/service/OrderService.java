package com.example.tricol.tricolspringbootrestapi.service;

import com.example.tricol.tricolspringbootrestapi.dto.request.CreateOrderRequest;
import com.example.tricol.tricolspringbootrestapi.dto.request.UpdateOrderStatus;
import com.example.tricol.tricolspringbootrestapi.dto.response.OrderResponse;
import com.example.tricol.tricolspringbootrestapi.model.Order;
import com.example.tricol.tricolspringbootrestapi.dto.response.ReceiveOrderResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request);

    OrderResponse getOrderById(Long id);

    List<OrderResponse> getAllOrders();

    OrderResponse updateOrder(Long id, UpdateOrderStatus request);
    List<OrderResponse> filterOrdersByStatus(Order.OrderStatus status);
    List<OrderResponse> filterOrdersBySupplier(Long supplierId);
    List<OrderResponse> filterOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate);


    ReceiveOrderResponse receiveOrder(Long orderId);
}
