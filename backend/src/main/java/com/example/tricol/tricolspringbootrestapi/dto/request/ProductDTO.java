package com.example.tricol.tricolspringbootrestapi.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;

    @NotBlank(message = "Reference is required")
    private String reference;

    @NotBlank(message = "Name is required")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Unit price is required")
    @Min(value = 0, message = "Unit price must be greater than or equal to 0")
    private Double unitPrice;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Measurement unit is required")
    private String measureUnit;

    @NotNull(message = "The re-order point is required")
    @Min(value = 0, message = "Re-order point must be greater than or equal to 0")
    private Double reorderPoint;

    @Min(value = 0, message = "Stock cannot be below 0")
    private Double currentStock;
}
