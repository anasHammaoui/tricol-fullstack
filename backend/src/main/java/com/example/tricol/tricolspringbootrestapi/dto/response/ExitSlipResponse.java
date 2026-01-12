package com.example.tricol.tricolspringbootrestapi.dto.response;

import com.example.tricol.tricolspringbootrestapi.enums.ExitReason;
import com.example.tricol.tricolspringbootrestapi.enums.ExitSlipStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExitSlipResponse {
    private Long id;
    private String slipNumber;
    private LocalDateTime exitDate;
    private String destinationWorkshop;
    private ExitReason reason;
    private ExitSlipStatus status;
    private String comment;
    private List<ExitSlipItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime validatedAt;
    private LocalDateTime cancelledAt;
    private String createdBy;
    private String validatedBy;
    private String cancelledBy;
}
