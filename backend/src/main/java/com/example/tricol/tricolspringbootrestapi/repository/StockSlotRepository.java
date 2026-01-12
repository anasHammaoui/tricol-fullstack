package com.example.tricol.tricolspringbootrestapi.repository;

import com.example.tricol.tricolspringbootrestapi.model.Product;
import com.example.tricol.tricolspringbootrestapi.model.StockSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockSlotRepository extends JpaRepository<StockSlot,Long> {
    
    List<StockSlot> findByProductAndAvailableQuantityGreaterThanOrderByEntryDateAsc(
            Product product, Double quantity);
    
    List<StockSlot> findByProductAndAvailableQuantityGreaterThan(
            Product product, Double quantity);
    
    List<StockSlot> findByProduct(Product product);
}
