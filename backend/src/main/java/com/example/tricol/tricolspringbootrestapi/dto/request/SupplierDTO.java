package com.example.tricol.tricolspringbootrestapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDTO {
    private String society;
    private String address;
    private String socialReason;
    private String contactAgent;
    private String email;
    private String phone;
    private String city;
    private String ice;
}