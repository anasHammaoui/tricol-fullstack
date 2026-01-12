import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentUser: User | null = null;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
