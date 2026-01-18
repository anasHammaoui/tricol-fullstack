import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { AuthService } from '../../../services/auth.service';
import { Supplier } from '../../../models/supplier.model';

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supplier-detail.component.html',
  styleUrls: ['./supplier-detail.component.css']
})
export class SupplierDetailComponent implements OnInit {
  private readonly supplierService = inject(SupplierService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  supplier: Supplier | null = null;
  isLoading = false;
  errorMessage = '';

  showDeleteModal = false;
  isDeleting = false;

  get canWrite(): boolean {
    return this.authService.hasPermission('SUPPLIERS_WRITE');
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSupplier(+id);
    }
  }

  loadSupplier(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.supplierService.getSupplierById(id).subscribe({
      next: (supplier) => {
        this.supplier = supplier;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading supplier:', error);
        this.errorMessage = 'Failed to load supplier details. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/suppliers']);
  }

  editSupplier(): void {
    if (this.supplier?.id) {
      this.router.navigate(['/dashboard/suppliers/edit', this.supplier.id]);
    }
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.supplier?.id) return;

    this.isDeleting = true;
    this.supplierService.deleteSupplier(this.supplier.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.router.navigate(['/dashboard/suppliers']);
      },
      error: (error) => {
        console.error('Error deleting supplier:', error);
        this.errorMessage = 'Failed to delete supplier. Please try again.';
        this.isDeleting = false;
        this.closeDeleteModal();
      }
    });
  }
}
