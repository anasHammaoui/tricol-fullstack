package com.example.tricol.tricolspringbootrestapi.security;

import com.example.tricol.tricolspringbootrestapi.model.UserApp;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class CustomUserDetails implements UserDetails {
    
    @Getter
    private final Long userId;
    private final String username;
    private final String password;
    private final boolean enabled;
    private final Collection<? extends GrantedAuthority> authorities;
    
    public CustomUserDetails(UserApp user) {
        this.userId = user.getId();
        this.username = user.getEmail();
        this.password = user.getPassword();
        this.enabled = user.getActive();
        this.authorities = buildAuthorities(user);
    }
    
    private Collection<? extends GrantedAuthority> buildAuthorities(UserApp user) {
        List<String> permissions = new ArrayList<>();
        
        // Add role-based permissions
        user.getRoles().forEach(role -> {
            permissions.add("ROLE_" + role.getName().name());
            role.getDefaultPermissions().forEach(permission -> 
                permissions.add(permission.getName())
            );
        });
        
        // Apply user-specific permission overrides
        user.getUserPermissions().forEach(userPermission -> {
            String permissionName = userPermission.getPermission().getName();
            if (userPermission.getGranted()) {
                if (!permissions.contains(permissionName)) {
                    permissions.add(permissionName);
                }
            } else {
                permissions.remove(permissionName);
            }
        });
        
        return permissions.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}