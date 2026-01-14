import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserResponse } from '../../../services/admin.service';

interface PermissionGroup {
  category: string;
  permissions: string[];
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);

  users: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];
  selectedUser: UserResponse | null = null;
  searchTerm: string = '';
  filterRole: string = 'all';
  
  availableRoles = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'RESPONSABLE_ACHATS', label: 'Purchasing Manager' },
    { value: 'MAGASINIER', label: 'Warehouse Manager' },
    { value: 'CHEF_ATELIER', label: 'Workshop Manager' }
  ];

  allPermissions: PermissionGroup[] = [
    {
      category: 'Suppliers',
      permissions: ['SUPPLIERS_READ', 'SUPPLIERS_WRITE']
    },
    {
      category: 'Products',
      permissions: ['PRODUCTS_READ', 'PRODUCTS_WRITE', 'PRODUCTS_CONFIGURE_ALERTS']
    },
    {
      category: 'Orders',
      permissions: ['ORDERS_READ', 'ORDERS_WRITE', 'ORDERS_VALIDATE', 'ORDERS_CANCEL', 'ORDERS_RECEIVE']
    },
    {
      category: 'Stock',
      permissions: ['STOCK_READ', 'STOCK_VALUATION', 'STOCK_HISTORY']
    },
    {
      category: 'Exit Slips',
      permissions: ['EXIT_SLIPS_READ', 'EXIT_SLIPS_CREATE', 'EXIT_SLIPS_VALIDATE', 'EXIT_SLIPS_CANCEL']
    },
    {
      category: 'Admin',
      permissions: ['ADMIN_USERS']
    }
  ];

  showUserModal = false;
  showRoleModal = false;
  showPermissionsModal = false;
  selectedRoleForAssignment = '';
  permissionsToUpdate: { [key: string]: boolean } = {};
  loading = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users || [];
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showError('Failed to load users');
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = this.filterRole === 'all' || 
        (this.filterRole === 'no-role' && (!user.roles || user.roles.length === 0)) ||
        (user.roles && user.roles.includes(this.filterRole));
      
      return matchesSearch && matchesRole;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  viewUser(user: UserResponse): void {
    this.selectedUser = user;
    this.showUserModal = true;
  }

  openRoleModal(user: UserResponse): void {
    this.selectedUser = user;
    this.selectedRoleForAssignment = user.roles?.[0] || '';
    this.showRoleModal = true;
  }

  openPermissionsModal(user: UserResponse): void {
    this.selectedUser = user;
    this.permissionsToUpdate = {};
    
    // Initialize with all effective permissions (explicit + role defaults)
    const effectivePermissions = this.getEffectivePermissions(user);
    effectivePermissions.forEach(permission => {
      this.permissionsToUpdate[permission] = true;
    });
    
    this.showPermissionsModal = true;
  }

  assignRole(): void {
    if (!this.selectedUser || !this.selectedRoleForAssignment) return;

    this.loading = true;
    this.adminService.assignRole(this.selectedUser.id, this.selectedRoleForAssignment).subscribe({
      next: () => {
        this.showSuccess('Role assigned successfully');
        this.showRoleModal = false;
        this.loading = false;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error assigning role:', error);
        this.showError('Failed to assign role');
        this.loading = false;
      }
    });
  }

  togglePermission(permission: string): void {
    this.permissionsToUpdate[permission] = !this.permissionsToUpdate[permission];
  }

  hasPermission(permission: string): boolean {
    return this.permissionsToUpdate[permission] === true;
  }

  savePermissions(): void {
    if (!this.selectedUser) return;

    this.loading = true;
    const updates: Promise<any>[] = [];

    // Get permission ID mapping
    const permissionIds: { [key: string]: number } = {
      'SUPPLIERS_READ': 1, 'SUPPLIERS_WRITE': 2,
      'PRODUCTS_READ': 3, 'PRODUCTS_WRITE': 4, 'PRODUCTS_CONFIGURE_ALERTS': 5,
      'ORDERS_READ': 6, 'ORDERS_WRITE': 7, 'ORDERS_VALIDATE': 8, 'ORDERS_CANCEL': 9, 'ORDERS_RECEIVE': 10,
      'STOCK_READ': 11, 'STOCK_VALUATION': 12, 'STOCK_HISTORY': 13,
      'EXIT_SLIPS_READ': 14, 'EXIT_SLIPS_CREATE': 15, 'EXIT_SLIPS_VALIDATE': 16, 'EXIT_SLIPS_CANCEL': 17,
      'ADMIN_USERS': 18
    };

    const roleDefaultPerms = this.selectedUser.roleDefaultPermissions || [];
    const currentExplicitPerms = this.selectedUser.permissions || [];

    Object.keys(this.permissionsToUpdate).forEach(permission => {
      const permissionId = permissionIds[permission];
      if (!permissionId) return;

      const isGranted = this.permissionsToUpdate[permission];
      const isRoleDefault = roleDefaultPerms.includes(permission);
      const hasExplicit = currentExplicitPerms.includes(permission);

      // Only handle explicit (custom) permissions, not role defaults
      if (isGranted && !isRoleDefault && !hasExplicit) {
        // Add new explicit permission
        updates.push(
          this.adminService.updateUserPermission(this.selectedUser!.id, permissionId, true).toPromise()
        );
      } else if (!isGranted && hasExplicit) {
        // Remove explicit permission
        updates.push(
          this.adminService.removeUserPermission(this.selectedUser!.id, permissionId).toPromise()
        );
      }
    });

    if (updates.length === 0) {
      this.showSuccess('No changes to save');
      this.showPermissionsModal = false;
      this.loading = false;
      return;
    }

    Promise.all(updates).then(() => {
      this.showSuccess('Permissions updated successfully');
      this.showPermissionsModal = false;
      this.loading = false;
      this.loadUsers();
    }).catch(error => {
      console.error('Error updating permissions:', error);
      this.showError('Failed to update permissions');
      this.loading = false;
    });
  }

  closeModal(): void {
    this.showUserModal = false;
    this.showRoleModal = false;
    this.showPermissionsModal = false;
    this.selectedUser = null;
  }

  getUserRoleLabel(roles: string[]): string {
    if (!roles || roles.length === 0) return 'No Role';
    const role = this.availableRoles.find(r => r.value === roles[0]);
    return role ? role.label : roles[0];
  }

  getEffectivePermissions(user: UserResponse): string[] {
    const explicitPermissions = user.permissions || [];
    const rolePermissions = user.roleDefaultPermissions || [];
    
    const allPermissions = new Set([...explicitPermissions, ...rolePermissions]);
    return Array.from(allPermissions);
  }

  isRoleDefaultPermission(permission: string, user: UserResponse): boolean {
    const roleDefaults = user.roleDefaultPermissions || [];
    return roleDefaults.includes(permission);
  }

  isExplicitPermission(permission: string, user: UserResponse): boolean {
    const explicitPerms = user.permissions || [];
    return explicitPerms.includes(permission);
  }

  getUserStatus(user: UserResponse): string {
    return user.roles && user.roles.length > 0 ? 'Active' : 'No Role';
  }

  getStatusClass(user: UserResponse): string {
    return user.roles && user.roles.length > 0 ? 'bg-success text-success' : 'bg-warning text-warning';
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 3000);
  }
}
