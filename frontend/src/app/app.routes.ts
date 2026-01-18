import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { permissionGuard } from './guards/permission.guard';
import { roleGuard } from './guards/role.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { UsersComponent } from './components/admin/users/users.component';
import { SuppliersListComponent } from './components/suppliers/suppliers-list/suppliers-list.component';
import { SupplierFormComponent } from './components/suppliers/supplier-form/supplier-form.component';
import { SupplierDetailComponent } from './components/suppliers/supplier-detail/supplier-detail.component';

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
      { 
        path: 'admin/users', 
        component: UsersComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      { 
        path: 'suppliers', 
        component: SuppliersListComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['SUPPLIERS_READ'] }
      },
      { 
        path: 'suppliers/create', 
        component: SupplierFormComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['SUPPLIERS_WRITE'] }
      },
      { 
        path: 'suppliers/edit/:id', 
        component: SupplierFormComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['SUPPLIERS_WRITE'] }
      },
      { 
        path: 'suppliers/:id', 
        component: SupplierDetailComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['SUPPLIERS_READ'] }
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
