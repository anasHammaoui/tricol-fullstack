import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
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
  private searchSubject = new Subject<string>();

  suppliers = signal<Supplier[]>([]);
  filteredSuppliers = signal<Supplier[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  errorMessage = signal('');
  successMessage = signal('');

  showDeleteModal = signal(false);
  supplierToDelete = signal<Supplier | null>(null);
  isDeleting = signal(false);

  currentPage = signal(1);
  pageSize = signal(5);
  pageSizeOptions = [5, 10, 25, 50, 100];

  totalPages = computed(() => 
    Math.ceil(this.filteredSuppliers().length / this.pageSize())
  );

  paginatedSuppliers = computed(() => {
    const filtered = this.filteredSuppliers();
    const page = this.currentPage();
    const size = this.pageSize();
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return filtered.slice(startIndex, endIndex);
  });

  startRecord = computed(() => {
    if (this.filteredSuppliers().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  endRecord = computed(() => {
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, this.filteredSuppliers().length);
  });

  pageNumbers = computed(() => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const total = this.totalPages();
    const current = this.currentPage();
    
    if (total <= maxPagesToShow) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      const halfWindow = Math.floor(maxPagesToShow / 2);
      let startPage = Math.max(1, current - halfWindow);
      let endPage = Math.min(total, startPage + maxPagesToShow - 1);
      
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  });

  get canWrite(): boolean {
    return this.authService.hasPermission('SUPPLIERS_WRITE');
  }

  constructor() {
    effect(() => {
      const total = this.totalPages();
      const current = this.currentPage();
      const filtered = this.filteredSuppliers().length;
      
      if (filtered > 0) {
        if (current > total) {
          this.currentPage.set(Math.max(1, total));
        } else if (current < 1) {
          this.currentPage.set(1);
        }
      }
    }, { allowSignalWrites: true });
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
          this.currentPage.set(1);
          this.filteredSuppliers.set(this.suppliers());
        }
      });
  }

  loadSuppliers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.supplierService.getAllSuppliers().subscribe({
      next: (suppliers) => {
        const data = suppliers || [];
        this.suppliers.set(data);
        this.filteredSuppliers.set(data);
        if (this.currentPage() !== 1) {
          this.currentPage.set(1);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.errorMessage.set('Failed to load suppliers. Please try again.');
        this.suppliers.set([]);
        this.filteredSuppliers.set([]);
        this.currentPage.set(1);
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.currentPage.set(1);
    this.searchSubject.next(searchTerm);
  }

  performSearch(query: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.supplierService.searchSuppliers(query).subscribe({
      next: (suppliers) => {
        this.currentPage.set(1);
        this.filteredSuppliers.set(suppliers || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error searching suppliers:', error);
        this.errorMessage.set('Search failed. Please try again.');
        this.currentPage.set(1);
        this.filteredSuppliers.set([]);
        this.isLoading.set(false);
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
    this.supplierToDelete.set(supplier);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.supplierToDelete.set(null);
  }

  confirmDelete(): void {
    const supplier = this.supplierToDelete();
    if (!supplier?.id) return;

    this.isDeleting.set(true);
    this.supplierService.deleteSupplier(supplier.id).subscribe({
      next: () => {
        this.showSuccess('Supplier deleted successfully');
        this.closeDeleteModal();
        this.loadSuppliers();
        this.isDeleting.set(false);
      },
      error: (error) => {
        console.error('Error deleting supplier:', error);
        this.showError('Failed to delete supplier. Please try again.');
        this.isDeleting.set(false);
      }
    });
  }

  createSupplier(): void {
    this.router.navigate(['/dashboard/suppliers/create']);
  }

  onPageChange(page: number): void {
    const total = this.totalPages();
    if (page >= 1 && page <= total) {
      this.currentPage.set(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize.set(parseInt(select.value));
    this.currentPage.set(1);
  }

  showSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  showError(message: string): void {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(''), 5000);
  }
}
