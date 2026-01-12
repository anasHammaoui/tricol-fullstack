package com.example.tricol.tricolspringbootrestapi.service;

import com.example.tricol.tricolspringbootrestapi.dto.request.ProductDTO;
import com.example.tricol.tricolspringbootrestapi.model.Product;

import java.util.List;

public interface ProductService {
    Product createProduct(ProductDTO ProductDTO);

    ProductDTO getProductById(Long id);

    List<ProductDTO> getProducts();

    ProductDTO updateProduct(Long id, ProductDTO ProductDTO);

    void deleteProduct(Long id);

    // stock
    Double getProductStock(Long id);

    //alert stock
    List<ProductDTO> getLowStockProducts();
}
