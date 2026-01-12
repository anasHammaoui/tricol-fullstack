package com.example.tricol.tricolspringbootrestapi.config;

import com.example.tricol.tricolspringbootrestapi.enums.RoleName;
import com.example.tricol.tricolspringbootrestapi.model.Permission;
import com.example.tricol.tricolspringbootrestapi.model.RoleApp;
import com.example.tricol.tricolspringbootrestapi.model.UserApp;
import com.example.tricol.tricolspringbootrestapi.repository.PermissionRepository;
import com.example.tricol.tricolspringbootrestapi.repository.RoleRepository;
import com.example.tricol.tricolspringbootrestapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.DependsOn;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@DependsOn("entityManagerFactory")
public class DataInitializer implements CommandLineRunner {
    
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializePermissions();
        initializeRoles();
        initializeAdminUser();
    }
    
    private void initializePermissions() {
        List<Permission> permissions = Arrays.asList(
            // Suppliers
            new Permission("SUPPLIERS_READ", "View suppliers", "SUPPLIERS"),
            new Permission("SUPPLIERS_WRITE", "Create/Edit/Delete suppliers", "SUPPLIERS"),
            
            // Products
            new Permission("PRODUCTS_READ", "View products", "PRODUCTS"),
            new Permission("PRODUCTS_WRITE", "Create/Edit/Delete products", "PRODUCTS"),
            new Permission("PRODUCTS_CONFIGURE_ALERTS", "Configure stock alerts", "PRODUCTS"),
            
            // Orders
            new Permission("ORDERS_READ", "View orders", "ORDERS"),
            new Permission("ORDERS_WRITE", "Create/Edit orders", "ORDERS"),
            new Permission("ORDERS_VALIDATE", "Validate orders", "ORDERS"),
            new Permission("ORDERS_CANCEL", "Cancel orders", "ORDERS"),
            new Permission("ORDERS_RECEIVE", "Receive orders", "ORDERS"),
            
            // Stock
            new Permission("STOCK_READ", "View stock and lots", "STOCK"),
            new Permission("STOCK_VALUATION", "View FIFO valuation", "STOCK"),
            new Permission("STOCK_HISTORY", "View movement history", "STOCK"),
            
            // Exit Slips
            new Permission("EXIT_SLIPS_READ", "View exit slips", "EXIT_SLIPS"),
            new Permission("EXIT_SLIPS_CREATE", "Create exit slips", "EXIT_SLIPS"),
            new Permission("EXIT_SLIPS_VALIDATE", "Validate exit slips", "EXIT_SLIPS"),
            new Permission("EXIT_SLIPS_CANCEL", "Cancel exit slips", "EXIT_SLIPS"),
            
            // Administration
            new Permission("ADMIN_USERS", "Manage users", "ADMIN")
        );
        
        permissions.forEach(permission -> {
            if (permissionRepository.findByName(permission.getName()).isEmpty()) {
                permissionRepository.save(permission);
            }
        });
    }
    
    private void initializeRoles() {
        // ADMIN Role
        RoleApp adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> new RoleApp(RoleName.ADMIN));
        adminRole.getDefaultPermissions().clear();
        adminRole.getDefaultPermissions().addAll(getAllPermissions());
        roleRepository.save(adminRole);
        
        // RESPONSABLE_ACHATS Role
        RoleApp respAchatsRole = roleRepository.findByName(RoleName.RESPONSABLE_ACHATS)
                .orElseGet(() -> new RoleApp(RoleName.RESPONSABLE_ACHATS));
        respAchatsRole.getDefaultPermissions().clear();
        respAchatsRole.getDefaultPermissions().addAll(getPermissionsByNames(Arrays.asList(
            "SUPPLIERS_READ", "SUPPLIERS_WRITE", "PRODUCTS_READ", "PRODUCTS_WRITE", 
            "PRODUCTS_CONFIGURE_ALERTS", "ORDERS_READ", "ORDERS_WRITE", "ORDERS_VALIDATE", 
            "ORDERS_CANCEL", "STOCK_READ", "STOCK_VALUATION", "STOCK_HISTORY", "EXIT_SLIPS_READ"
        )));
        roleRepository.save(respAchatsRole);
        
        // MAGASINIER Role
        RoleApp magasinierRole = roleRepository.findByName(RoleName.MAGASINIER)
                .orElseGet(() -> new RoleApp(RoleName.MAGASINIER));
        magasinierRole.getDefaultPermissions().clear();
        magasinierRole.getDefaultPermissions().addAll(getPermissionsByNames(Arrays.asList(
            "SUPPLIERS_READ", "PRODUCTS_READ", "ORDERS_READ", "ORDERS_RECEIVE", 
            "STOCK_READ", "STOCK_VALUATION", "STOCK_HISTORY", "EXIT_SLIPS_READ", 
            "EXIT_SLIPS_CREATE", "EXIT_SLIPS_VALIDATE", "EXIT_SLIPS_CANCEL"
        )));
        roleRepository.save(magasinierRole);
        
        // CHEF_ATELIER Role
        RoleApp chefAtelierRole = roleRepository.findByName(RoleName.CHEF_ATELIER)
                .orElseGet(() -> new RoleApp(RoleName.CHEF_ATELIER));
        chefAtelierRole.getDefaultPermissions().clear();
        chefAtelierRole.getDefaultPermissions().addAll(getPermissionsByNames(Arrays.asList(
            "PRODUCTS_READ", "STOCK_READ", "STOCK_HISTORY", "EXIT_SLIPS_READ", "EXIT_SLIPS_CREATE"
        )));
        roleRepository.save(chefAtelierRole);
    }
    
    private void initializeAdminUser() {
        if (!userRepository.existsByEmail("admin@tricol.com")) {
            UserApp admin = new UserApp();
            admin.setFirstName("Admin");
            admin.setLastName("Tricol");
            admin.setEmail("admin@tricol.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setActive(true);
            
            RoleApp adminRole = roleRepository.findByName(RoleName.ADMIN).orElseThrow();
            admin.getRoles().add(adminRole);
            
            userRepository.save(admin);
            System.out.println("Admin user created with email: admin@tricol.com and password: admin123");
        } else {
            System.out.println("Admin user already exists");
        }
    }
    
    private List<Permission> getAllPermissions() {
        return new ArrayList<>(permissionRepository.findAll());
    }
    
    private List<Permission> getPermissionsByNames(List<String> names) {
        List<Permission> permissions = new ArrayList<>();
        names.forEach(name -> {
            permissionRepository.findByName(name).ifPresent(permissions::add);
        });
        return permissions;
    }
}