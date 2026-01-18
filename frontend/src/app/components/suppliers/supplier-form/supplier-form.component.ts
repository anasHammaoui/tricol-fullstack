import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../models/supplier.model';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.css']
})
export class SupplierFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly supplierService = inject(SupplierService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  supplierForm!: FormGroup;
  isEditMode = false;
  supplierId: number | null = null;
  isSubmitting = false;
  errorMessage = '';
  isLoading = false;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.supplierForm = this.fb.group({
      society: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      socialReason: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      contactAgent: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+212|0)[5-7]\d{8}$/)]],
      ice: ['', [Validators.required, Validators.pattern(/^\d{15}$/), Validators.minLength(15), Validators.maxLength(15)]]
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.supplierId = +id;
      this.loadSupplier(this.supplierId);
    }
  }

  loadSupplier(id: number): void {
    this.isLoading = true;
    this.supplierService.getSupplierById(id).subscribe({
      next: (supplier) => {
        this.supplierForm.patchValue(supplier);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading supplier:', error);
        this.errorMessage = 'Failed to load supplier data. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      this.markFormGroupTouched(this.supplierForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const supplierData: Supplier = this.supplierForm.value;

    const operation = this.isEditMode && this.supplierId
      ? this.supplierService.updateSupplier(this.supplierId, supplierData)
      : this.supplierService.createSupplier(supplierData);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/dashboard/suppliers']);
      },
      error: (error) => {
        console.error('Error saving supplier:', error);
        this.errorMessage = error.error?.message || 'Failed to save supplier. Please check your input and try again.';
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/suppliers']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.supplierForm.get(fieldName);
    if (!field || !field.touched || !field.errors) {
      return '';
    }

    const errors = field.errors;
    
    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    if (errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} must not exceed ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['pattern']) {
      if (fieldName === 'phone') {
        return 'Please enter a valid Moroccan phone number (e.g., +212612345678 or 0612345678)';
      }
      if (fieldName === 'ice') {
        return 'ICE must be exactly 15 digits';
      }
    }

    return 'Invalid value';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.supplierForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      society: 'Company name',
      socialReason: 'Legal name',
      address: 'Address',
      city: 'City',
      contactAgent: 'Contact person',
      email: 'Email',
      phone: 'Phone',
      ice: 'ICE'
    };
    return labels[fieldName] || fieldName;
  }
}
