package com.example.tricol.tricolspringbootrestapi.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    private Long supplierId;
    private List<CreateOrderItemRequest> items;
}
