import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private searchSubject = new Subject<string>();

  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  selectedCategory = signal('all');
  showLowStockOnly = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  showDeleteModal = signal(false);
  productToDelete = signal<Product | null>(null);
  isDeleting = signal(false);

  currentPage = signal(1);
  pageSize = signal(5);
  pageSizeOptions = [5, 10, 25, 50, 100];

  categories = ['all', 'Electronics', 'Furniture', 'Supplies', 'Raw Materials', 'Tools'];

  totalPages = computed(() => 
    Math.ceil(this.filteredProducts().length / this.pageSize())
  );

  paginatedProducts = computed(() => {
    const filtered = this.filteredProducts();
    const page = this.currentPage();
    const size = this.pageSize();
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return filtered.slice(startIndex, endIndex);
  });

  startRecord = computed(() => {
    if (this.filteredProducts().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  endRecord = computed(() => {
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, this.filteredProducts().length);
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
    return this.authService.hasPermission('PRODUCTS_WRITE');
  }

  constructor() {
    effect(() => {
      const total = this.totalPages();
      const current = this.currentPage();
      const filtered = this.filteredProducts().length;
      
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
    this.loadProducts();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.applyFilters();
      });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        const data = products || [];
        this.products.set(data);
        this.applyFilters();
        if (this.currentPage() !== 1) {
          this.currentPage.set(1);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage.set('Failed to load products. Please try again.');
        this.products.set([]);
        this.filteredProducts.set([]);
        this.currentPage.set(1);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.products()];
    
    const searchTerm = this.searchTerm().toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.reference.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
      );
    }

    const category = this.selectedCategory();
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (this.showLowStockOnly()) {
      filtered = filtered.filter(p => p.currentStock <= p.reorderPoint);
    }

    this.currentPage.set(1);
    this.filteredProducts.set(filtered);
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.searchSubject.next(searchTerm);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  onLowStockToggle(checked: boolean): void {
    this.showLowStockOnly.set(checked);
    this.applyFilters();
  }

  isLowStock(product: Product): boolean {
    return product.currentStock <= product.reorderPoint;
  }

  viewProduct(id: number): void {
    this.router.navigate(['/dashboard/products', id]);
  }

  editProduct(id: number): void {
    this.router.navigate(['/dashboard/products/edit', id]);
  }

  openDeleteModal(product: Product): void {
    this.productToDelete.set(product);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.productToDelete.set(null);
  }

  confirmDelete(): void {
    const product = this.productToDelete();
    if (!product?.id) return;

    this.isDeleting.set(true);
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.showSuccess('Product deleted successfully');
        this.closeDeleteModal();
        this.loadProducts();
        this.isDeleting.set(false);
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.showError('Failed to delete product. Please try again.');
        this.isDeleting.set(false);
      }
    });
  }

  createProduct(): void {
    this.router.navigate(['/dashboard/products/create']);
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
