import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  product = signal<Product | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  get canWrite(): boolean {
    return this.authService.hasPermission('PRODUCTS_WRITE');
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
    }
  }

  loadProduct(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.errorMessage.set('Failed to load product details. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  isLowStock(): boolean {
    const prod = this.product();
    return prod ? prod.currentStock <= prod.reorderPoint : false;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/products']);
  }

  editProduct(): void {
    const prod = this.product();
    if (prod?.id) {
      this.router.navigate(['/dashboard/products/edit', prod.id]);
    }
  }
}
