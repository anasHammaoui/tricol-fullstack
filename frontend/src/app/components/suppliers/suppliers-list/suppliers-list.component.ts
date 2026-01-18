import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { AuthService } from '../../../services/auth.service';
import { Supplier } from '../../../models/supplier.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './suppliers-list.component.html',
  styleUrls: ['./suppliers-list.component.css']
})
export class SuppliersListComponent implements OnInit {
  private readonly supplierService = inject(SupplierService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private searchSubject = new Subject<string>();

  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  isLoading = true;
  searchTerm = '';
  errorMessage = '';
  successMessage = '';

  showDeleteModal = false;
  supplierToDelete: Supplier | null = null;
  isDeleting = false;

  get canWrite(): boolean {
    return this.authService.hasPermission('SUPPLIERS_WRITE');
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        if (searchTerm.trim()) {
          this.performSearch(searchTerm);
        } else {
          this.filteredSuppliers = this.suppliers;
        }
      });
  }

  loadSuppliers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.supplierService.getAllSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers || [];
        this.filteredSuppliers = suppliers || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.errorMessage = 'Failed to load suppliers. Please try again.';
        this.isLoading = false;
        this.suppliers = [];
        this.filteredSuppliers = [];
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  performSearch(query: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.supplierService.searchSuppliers(query).subscribe({
      next: (suppliers) => {
        this.filteredSuppliers = suppliers || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error searching suppliers:', error);
        this.errorMessage = 'Search failed. Please try again.';
        this.isLoading = false;
        this.filteredSuppliers = [];
        this.cdr.detectChanges();
      }
    });
  }

  viewSupplier(id: number): void {
    this.router.navigate(['/dashboard/suppliers', id]);
  }

  editSupplier(id: number): void {
    this.router.navigate(['/dashboard/suppliers/edit', id]);
  }

  openDeleteModal(supplier: Supplier): void {
    this.supplierToDelete = supplier;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.supplierToDelete = null;
  }

  confirmDelete(): void {
    if (!this.supplierToDelete?.id) return;

    this.isDeleting = true;
    this.supplierService.deleteSupplier(this.supplierToDelete.id).subscribe({
      next: () => {
        this.showSuccess('Supplier deleted successfully');
        this.closeDeleteModal();
        this.loadSuppliers();
        this.isDeleting = false;
      },
      error: (error) => {
        console.error('Error deleting supplier:', error);
        this.showError('Failed to delete supplier. Please try again.');
        this.isDeleting = false;
      }
    });
  }

  createSupplier(): void {
    this.router.navigate(['/dashboard/suppliers/create']);
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
  }
}
