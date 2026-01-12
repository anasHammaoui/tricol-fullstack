package com.example.tricol.tricolspringbootrestapi.service.impl;

import com.example.tricol.tricolspringbootrestapi.dto.request.LoginRequest;
import com.example.tricol.tricolspringbootrestapi.dto.request.RegisterRequest;
import com.example.tricol.tricolspringbootrestapi.dto.response.JwtResponse;
import com.example.tricol.tricolspringbootrestapi.exception.DuplicateResourceException;
import com.example.tricol.tricolspringbootrestapi.exception.ResourceNotFoundException;
import com.example.tricol.tricolspringbootrestapi.model.UserApp;
import com.example.tricol.tricolspringbootrestapi.repository.UserRepository;
import com.example.tricol.tricolspringbootrestapi.security.CustomUserDetails;
import com.example.tricol.tricolspringbootrestapi.security.JwtTokenProvider;
import com.example.tricol.tricolspringbootrestapi.model.RoleApp;
import com.example.tricol.tricolspringbootrestapi.model.UserPermission;
import com.example.tricol.tricolspringbootrestapi.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    
    @Override
    public JwtResponse login(LoginRequest loginRequest, HttpServletRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String jwt = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(authentication);

            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(auth -> auth.startsWith("ROLE_"))
                    .map(role -> role.substring(5))
                    .collect(Collectors.toList());

            List<String> permissions = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(auth -> !auth.startsWith("ROLE_"))
                    .collect(Collectors.toList());

            UserApp user = findByEmail(loginRequest.getEmail());

            return new JwtResponse(jwt, refreshToken, user.getId(),
                                 user.getEmail(), user.getFirstName(),
                                 user.getLastName(), roles, permissions);
//        try {
////
//        } catch (BadCredentialsException e) {
//            throw new BadCredentialsException("Invalid email or password");
//        }
    }
    
    @Override
    public String register(RegisterRequest registerRequest, HttpServletRequest request) {
        if (existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateResourceException("Email is already taken");
        }
        
        UserApp user = createUser(registerRequest);
        

        
        return "User registered successfully. Please wait for admin to assign a role.";
    }
    
    @Override
    public JwtResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }
        
        String username = tokenProvider.getUsernameFromJWT(refreshToken);
        UserApp user = findByEmail(username);
        
        CustomUserDetails userDetails = new CustomUserDetails(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        
        String newToken = tokenProvider.generateToken(authentication);
        String newRefreshToken = tokenProvider.generateRefreshToken(authentication);
        
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))
                .map(role -> role.substring(5))
                .collect(Collectors.toList());
        
        List<String> permissions = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> !auth.startsWith("ROLE_"))
                .collect(Collectors.toList());
        
        return new JwtResponse(newToken, newRefreshToken, user.getId(), 
                             user.getEmail(), user.getFirstName(), 
                             user.getLastName(), roles, permissions);
    }
    
    @Override
    public UserApp createUser(RegisterRequest registerRequest) {
        UserApp user = new UserApp();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setActive(true);
        
        return userRepository.save(user);
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserApp findByEmail(String email) {
        UserApp user = userRepository.findByEmailWithRoles(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        // Load roles with permissions separately
        List<RoleApp> rolesWithPermissions = userRepository.findRolesWithPermissionsByUserEmail(email);
        user.getRoles().clear();
        user.getRoles().addAll(rolesWithPermissions);
        
        // Load user permissions separately
        List<UserPermission> userPermissions = userRepository.findUserPermissionsByEmail(email);
        user.getUserPermissions().clear();
        user.getUserPermissions().addAll(userPermissions);
        
        return user;
    }
}