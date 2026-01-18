import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  productForm!: FormGroup;
  isEditMode = signal(false);
  productId = signal<number | null>(null);
  isSubmitting = signal(false);
  errorMessage = signal('');
  isLoading = signal(false);

  categories = ['Electronics', 'Furniture', 'Supplies', 'Raw Materials', 'Tools'];
  measureUnits = ['Unit', 'Kg', 'Liter', 'Meter', 'Box', 'Pallet'];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      reference: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      measureUnit: ['', [Validators.required]],
      reorderPoint: [0, [Validators.required, Validators.min(0)]],
      currentStock: [{ value: 0, disabled: this.isEditMode() }, [Validators.min(0)]]
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(+id);
      this.productForm.get('currentStock')?.disable();
      this.loadProduct(+id);
    }
  }

  loadProduct(id: number): void {
    this.isLoading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.errorMessage.set('Failed to load product data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.productForm.getRawValue();
    const productData: Product = {
      ...formValue,
      id: this.productId()
    };

    if (this.isEditMode()) {
      this.productService.updateProduct(this.productId()!, productData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/products']);
        },
        error: (error: any) => {
          console.error('Error updating product:', error);
          this.errorMessage.set(error.error?.message || 'Failed to update product. Please try again.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/products']);
        },
        error: (error: any) => {
          console.error('Error creating product:', error);
          this.errorMessage.set(error.error?.message || 'Failed to create product. Please try again.');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/products']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['email']) return 'Invalid email format';

    return 'Invalid field';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      reference: 'Reference',
      name: 'Product Name',
      description: 'Description',
      unitPrice: 'Unit Price',
      category: 'Category',
      measureUnit: 'Measure Unit',
      reorderPoint: 'Reorder Point',
      currentStock: 'Current Stock'
    };
    return labels[fieldName] || fieldName;
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
}
