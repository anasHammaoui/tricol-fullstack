package com.example.tricol.tricolspringbootrestapi.controller;

import com.example.tricol.tricolspringbootrestapi.dto.response.UserResponseDto;
import com.example.tricol.tricolspringbootrestapi.enums.RoleName;
import com.example.tricol.tricolspringbootrestapi.service.AdminService;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    
    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
    
    @PostMapping("/users/{userId}/assign-role")
    public ResponseEntity<?> assignRole(@PathVariable Long userId, 
                                      @RequestParam RoleName roleName) {
        adminService.assignRoleToUser(userId, roleName);
        return ResponseEntity.ok("Role assigned successfully");
    }
    
    @PostMapping("/users/{userId}/permissions/{permissionId}")
    public ResponseEntity<?> updateUserPermission(@PathVariable Long userId,
                                                @PathVariable Long permissionId,
                                                @RequestParam Boolean granted) {
        adminService.updateUserPermission(userId, permissionId, granted);
        return ResponseEntity.ok("Permission updated successfully");
    }
    

    
    @DeleteMapping("/users/{userId}/permissions/{permissionId}")
    public ResponseEntity<?> removeUserPermission(@PathVariable Long userId,
                                                 @PathVariable Long permissionId) {
        adminService.removeUserPermission(userId, permissionId);
        return ResponseEntity.ok("Permission removed successfully");
    }
}