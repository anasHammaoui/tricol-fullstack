package com.example.tricol.tricolspringbootrestapi.service.impl;

import com.example.tricol.tricolspringbootrestapi.dto.request.ProductDTO;
import com.example.tricol.tricolspringbootrestapi.exception.DuplicateResourceException;
import com.example.tricol.tricolspringbootrestapi.exception.ResourceNotFoundException;
import com.example.tricol.tricolspringbootrestapi.mapper.ProductMapper;
import com.example.tricol.tricolspringbootrestapi.model.Product;
import com.example.tricol.tricolspringbootrestapi.repository.ProductRepository;
import com.example.tricol.tricolspringbootrestapi.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductMapper productMapper;

    @Override
    public Product createProduct(ProductDTO ProductDTO){
        // Check for duplicate reference
        if (productRepository.findByReference(ProductDTO.getReference()).isPresent()) {
            throw new DuplicateResourceException("Product with reference '" + ProductDTO.getReference() + "' already exists");
        }
        return productRepository.save(productMapper.toEntity(ProductDTO));
    }

    @Override
    public ProductDTO getProductById(Long id){
        return productRepository.findById(id)
                .map(product -> productMapper.toDTO(product))
                .orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " not found"));
    }

    @Override
    public List<ProductDTO> getProducts() {
        return productMapper.toDTOList(productRepository.findAll());
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO ProductDTO){
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " not found"));

        productMapper.updateProductFromDTO(ProductDTO, existingProduct);
        return productMapper.toDTO(productRepository.save(existingProduct));
    }

    @Override
    public void deleteProduct(Long id){
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " not found"));

        productRepository.delete(existingProduct);
    }

    @Override
    public Double getProductStock(Long id){
        return productRepository.findById(id)
                .map(Product::getCurrentStock)
                .orElse(0.0);
    }

    @Override
    public List<ProductDTO> getLowStockProducts(){
        List<Product> products = productRepository.findAll();
        return products.stream().filter(product -> {
            try{
                return product.getCurrentStock() < product.getReorderPoint();
            } catch (NumberFormatException  e){
                return false; // skip invalid reorderPoint
            }
        }).map(productMapper::toDTO).toList();
    }

}
