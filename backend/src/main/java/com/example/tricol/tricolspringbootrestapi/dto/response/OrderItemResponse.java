package com.example.tricol.tricolspringbootrestapi.dto.response;

import lombok.Data;

@Data
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private Double quantity;
    private Double unitPrice;
    private Double total;
}
