package com.example.tricol.tricolspringbootrestapi.dto.request;

import lombok.Data;

@Data
public class CreateOrderItemRequest {
    private Long productId;
    private Double quantity;
}
