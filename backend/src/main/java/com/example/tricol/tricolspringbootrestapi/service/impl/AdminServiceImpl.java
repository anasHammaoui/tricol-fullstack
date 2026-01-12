package com.example.tricol.tricolspringbootrestapi.service.impl;

import com.example.tricol.tricolspringbootrestapi.dto.response.UserResponseDto;
import com.example.tricol.tricolspringbootrestapi.enums.RoleName;
import com.example.tricol.tricolspringbootrestapi.exception.ResourceNotFoundException;
import com.example.tricol.tricolspringbootrestapi.mapper.UserMapper;
import com.example.tricol.tricolspringbootrestapi.model.RoleApp;
import com.example.tricol.tricolspringbootrestapi.model.UserApp;
import com.example.tricol.tricolspringbootrestapi.model.UserPermission;
import com.example.tricol.tricolspringbootrestapi.repository.*;
import com.example.tricol.tricolspringbootrestapi.service.AdminService;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final UserMapper userMapper;
    
    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public void assignRoleToUser(Long userId, RoleName roleName) {
        UserApp user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        RoleApp role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        
        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
            userRepository.save(user);
        }
    }
    
    @Override
    public void updateUserPermission(Long userId, Long permissionId, Boolean granted) {
        UserApp user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        UserPermission userPermission = userPermissionRepository
                .findByUserIdAndPermissionId(userId, permissionId)
                .orElseGet(() -> {
                    UserPermission newUserPermission = new UserPermission();
                    newUserPermission.setUser(user);
                    newUserPermission.setPermission(permissionRepository.findById(permissionId)
                            .orElseThrow(() -> new ResourceNotFoundException("Permission not found with id: " + permissionId)));
                    return newUserPermission;
                });
        
        userPermission.setGranted(granted);
        userPermissionRepository.save(userPermission);
    }
    
    @Override
    public void removeUserPermission(Long userId, Long permissionId) {
        userPermissionRepository.findByUserIdAndPermissionId(userId, permissionId)
                .ifPresent(userPermissionRepository::delete);
    }
}