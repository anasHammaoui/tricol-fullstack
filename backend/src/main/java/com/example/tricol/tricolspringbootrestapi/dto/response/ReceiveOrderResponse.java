package com.example.tricol.tricolspringbootrestapi.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReceiveOrderResponse {
    private Long id;
    private Long supplierId;
    private LocalDateTime orderDate;
    private String status;
    private Double totalAmount;
}
