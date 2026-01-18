import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/tricol/api/v2'}/suppliers`;

  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.apiUrl}/create`, supplier);
  }

  updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier);
  }

  deleteSupplier(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  searchSuppliers(query: string): Observable<Supplier[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Supplier[]>(`${this.apiUrl}/search`, { params });
  }
}
