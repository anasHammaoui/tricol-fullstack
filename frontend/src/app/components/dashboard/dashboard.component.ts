import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.models';
import { MenuItem, getMenuItemsForRoles } from '../../config/menu.config';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentUser: User | null = null;
  menuItems: MenuItem[] = [];
  isSidebarOpen = true;
  openSubmenu: string | null = null;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.menuItems = getMenuItemsForRoles(this.currentUser.roles);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSubmenu(label: string): void {
    this.openSubmenu = this.openSubmenu === label ? null : label;
  }

  isSubmenuOpen(label: string): boolean {
    return this.openSubmenu === label;
  }

  onLogout(): void {
    this.authService.logout();
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';
    const firstInitial = this.currentUser.firstName?.charAt(0) || '';
    const lastInitial = this.currentUser.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  getUserRole(): string {
    if (!this.currentUser || !this.currentUser.roles.length) return 'User';
    const role = this.currentUser.roles[0];
    
    const roleMap: { [key: string]: string } = {
      'ROLE_ADMIN': 'Administrator',
      'ROLE_RESPONSABLE_ACHATS': 'Purchasing Manager',
      'ROLE_MAGASINIER': 'Warehouse Manager',
      'ROLE_CHEF_ATELIER': 'Workshop Manager'
    };
    
    return roleMap[role] || role.replace('ROLE_', '').replace(/_/g, ' ');
  }
}
