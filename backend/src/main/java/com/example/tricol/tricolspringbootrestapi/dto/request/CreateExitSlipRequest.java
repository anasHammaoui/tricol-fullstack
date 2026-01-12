package com.example.tricol.tricolspringbootrestapi.dto.request;

import com.example.tricol.tricolspringbootrestapi.enums.ExitReason;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateExitSlipRequest {
    
    @NotNull(message = "Exit date is required")
    private LocalDateTime exitDate;
    
    @NotBlank(message = "Destination workshop is required")
    @Size(max = 100, message = "Destination workshop must not exceed 100 characters")
    private String destinationWorkshop;
    
    @NotNull(message = "Exit reason is required")
    private ExitReason reason;
    
    @Size(max = 500, message = "Comment must not exceed 500 characters")
    private String comment;
    
    @NotEmpty(message = "Items list cannot be empty")
    @Valid
    private List<ExitSlipItemRequest> items;
}
