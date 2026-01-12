package com.example.tricol.tricolspringbootrestapi.security;

import com.example.tricol.tricolspringbootrestapi.model.RoleApp;
import com.example.tricol.tricolspringbootrestapi.model.UserApp;
import com.example.tricol.tricolspringbootrestapi.model.UserPermission;
import com.example.tricol.tricolspringbootrestapi.repository.UserRepository;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Load user with roles only
        UserApp user = userRepository.findByEmailWithRoles(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        
        // Load roles with permissions separately
        List<RoleApp> rolesWithPermissions = userRepository.findRolesWithPermissionsByUserEmail(email);
        user.getRoles().clear();
        user.getRoles().addAll(rolesWithPermissions);
        
        // Load user permissions separately
        List<UserPermission> userPermissions = userRepository.findUserPermissionsByEmail(email);
        user.getUserPermissions().clear();
        user.getUserPermissions().addAll(userPermissions);
        
        return new CustomUserDetails(user);
    }
}