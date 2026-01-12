package com.example.tricol.tricolspringbootrestapi.service;

import com.example.tricol.tricolspringbootrestapi.dto.request.LoginRequest;
import com.example.tricol.tricolspringbootrestapi.dto.request.RegisterRequest;
import com.example.tricol.tricolspringbootrestapi.dto.response.JwtResponse;
import com.example.tricol.tricolspringbootrestapi.model.UserApp;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {
    JwtResponse login(LoginRequest loginRequest, HttpServletRequest request);
    String register(RegisterRequest registerRequest, HttpServletRequest request);
    JwtResponse refreshToken(String refreshToken);
    UserApp createUser(RegisterRequest registerRequest);
    boolean existsByEmail(String email);
    UserApp findByEmail(String email);
}