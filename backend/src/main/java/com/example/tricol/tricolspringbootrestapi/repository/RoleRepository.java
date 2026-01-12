package com.example.tricol.tricolspringbootrestapi.repository;

import com.example.tricol.tricolspringbootrestapi.enums.RoleName;
import com.example.tricol.tricolspringbootrestapi.model.RoleApp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<RoleApp, Long> {
    Optional<RoleApp> findByName(RoleName name);
}