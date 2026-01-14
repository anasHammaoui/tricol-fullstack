package com.example.tricol.tricolspringbootrestapi.mapper;

import com.example.tricol.tricolspringbootrestapi.dto.response.UserResponseDto;
import com.example.tricol.tricolspringbootrestapi.model.Permission;
import com.example.tricol.tricolspringbootrestapi.model.RoleApp;
import com.example.tricol.tricolspringbootrestapi.model.UserApp;
import com.example.tricol.tricolspringbootrestapi.model.UserPermission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    
    @Mapping(target = "roles", expression = "java(mapRoles(user))")
    @Mapping(target = "permissions", expression = "java(mapUserPermissions(user))")
    @Mapping(target = "roleDefaultPermissions", expression = "java(mapRoleDefaultPermissions(user))")
    UserResponseDto toResponseDto(UserApp user);
    
    default List<String> mapRoles(UserApp user) {
        if (user.getRoles() == null) return new ArrayList<>();
        return user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());
    }
    
    default List<String> mapUserPermissions(UserApp user) {
        if (user.getUserPermissions() == null) return new ArrayList<>();
        return user.getUserPermissions().stream()
                .filter(UserPermission::getGranted)
                .map(up -> up.getPermission().getName())
                .collect(Collectors.toList());
    }
    
    default List<String> mapRoleDefaultPermissions(UserApp user) {
        if (user.getRoles() == null) return new ArrayList<>();
        return user.getRoles().stream()
                .flatMap(role -> role.getDefaultPermissions().stream())
                .map(Permission::getName)
                .distinct()
                .collect(Collectors.toList());
    }
}