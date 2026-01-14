import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { UsersComponent } from './components/admin/users/users.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'admin/users', component: UsersComponent },
      // Add your other routes here as children
      // { path: 'suppliers', component: SuppliersComponent },
      // { path: 'products', component: ProductsComponent },
      // { path: 'orders', component: OrdersComponent },
      // etc.
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
