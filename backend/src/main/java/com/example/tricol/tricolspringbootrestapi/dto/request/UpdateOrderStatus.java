package com.example.tricol.tricolspringbootrestapi.dto.request;

import com.example.tricol.tricolspringbootrestapi.model.Order;
import lombok.*;

import java.util.List;
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatus {
    private List<CreateOrderItemRequest> items;
    private Order.OrderStatus status;
}
