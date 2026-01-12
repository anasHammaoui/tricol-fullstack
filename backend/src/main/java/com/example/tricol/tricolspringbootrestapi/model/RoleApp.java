package com.example.tricol.tricolspringbootrestapi.model;

import com.example.tricol.tricolspringbootrestapi.enums.RoleName;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleApp {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 60, unique = true)
    private RoleName name;
    
    @ManyToMany(mappedBy = "roles")
    private List<UserApp> users = new ArrayList<>();
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "role_permissions",
               joinColumns = @JoinColumn(name = "role_id"),
               inverseJoinColumns = @JoinColumn(name = "permission_id"))
    private List<Permission> defaultPermissions = new ArrayList<>();
    
    public RoleApp(RoleName name) {
        this.name = name;
    }
}