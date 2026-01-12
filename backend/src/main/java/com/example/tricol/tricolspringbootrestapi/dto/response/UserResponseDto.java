package com.example.tricol.tricolspringbootrestapi.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserResponseDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Boolean active;
    private List<String> roles;
    private LocalDateTime createdAt;
}