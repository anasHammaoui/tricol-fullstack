package com.example.tricol.tricolspringbootrestapi.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private Long supplierId;
    private LocalDateTime orderDate;
    private String status;
    private Double totalAmount;

    private List<OrderItemResponse> items;
}
