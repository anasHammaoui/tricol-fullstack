package com.example.tricol.tricolspringbootrestapi.service;

import com.example.tricol.tricolspringbootrestapi.dto.response.UserResponseDto;
import com.example.tricol.tricolspringbootrestapi.enums.RoleName;
import java.util.List;

public interface AdminService {
    List<UserResponseDto> getAllUsers();
    void assignRoleToUser(Long userId, RoleName roleName);
    void updateUserPermission(Long userId, Long permissionId, Boolean granted);
    void removeUserPermission(Long userId, Long permissionId);
}