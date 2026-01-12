package com.example.tricol.tricolspringbootrestapi.repository;

import com.example.tricol.tricolspringbootrestapi.model.RoleApp;
import com.example.tricol.tricolspringbootrestapi.model.UserApp;
import com.example.tricol.tricolspringbootrestapi.model.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserApp, Long> {
    
    Optional<UserApp> findByEmail(String email);
    
    Boolean existsByEmail(String email);
    
    @Query("SELECT u FROM UserApp u " +
           "LEFT JOIN FETCH u.roles " +
           "WHERE u.email = :email")
    Optional<UserApp> findByEmailWithRoles(@Param("email") String email);
    
    @Query("SELECT up FROM UserPermission up " +
           "LEFT JOIN FETCH up.permission " +
           "WHERE up.user.email = :email")
    List<UserPermission> findUserPermissionsByEmail(@Param("email") String email);
    
    @Query("SELECT DISTINCT r FROM RoleApp r " +
           "LEFT JOIN FETCH r.defaultPermissions " +
           "WHERE r IN (SELECT ur FROM UserApp u JOIN u.roles ur WHERE u.email = :email)")
    List<RoleApp> findRolesWithPermissionsByUserEmail(@Param("email") String email);
}